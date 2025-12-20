package com.ticketkatum.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * AI Chatbot Service
 * Provides intelligent conversation capabilities using OpenAI GPT-4
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final OpenAiService openAiService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.max-tokens}")
    private Integer maxTokens;

    @Value("${openai.temperature}")
    private Double temperature;

    @Value("${chatbot.max-conversation-history}")
    private Integer maxHistory;

    @Value("${chatbot.conversation-ttl}")
    private Long conversationTtl;

    private static final String CONVERSATION_KEY_PREFIX = "chatbot:conversation:";
    private static final String SYSTEM_PROMPT = """
            You are a helpful travel assistant for TicketKatum, a travel booking platform in Nepal.
            You help users:
            - Search for hotels and buses
            - Book accommodations and transportation
            - Answer questions about destinations
            - Provide travel recommendations
            
            Be friendly, concise, and helpful. If you don't know something, admit it.
            Always try to guide users toward making a booking.
            
            Available services:
            - Hotel booking in major cities (Kathmandu, Pokhara, Chitwan, etc.)
            - Bus booking for intercity travel
            - Payment processing
            
            When users ask about booking, collect:
            - Destination
            - Travel dates
            - Number of guests/passengers
            - Budget preferences
            """;

    /**
     * Send a message and get AI response
     */
    public ChatResponse chat(String userId, String message) {
        log.info("Processing chat message for user: {}", userId);

        try {
            // Get conversation history
            List<ChatMessage> messages = getConversationHistory(userId);

            // Add user message
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), message));

            // Create chat completion request
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(model)
                    .messages(messages)
                    .maxTokens(maxTokens)
                    .temperature(temperature)
                    .build();

            // Get AI response
            var completion = openAiService.createChatCompletion(request);
            String aiResponse = completion.getChoices().get(0).getMessage().getContent();

            // Add AI response to history
            messages.add(new ChatMessage(ChatMessageRole.ASSISTANT.value(), aiResponse));

            // Save conversation history
            saveConversationHistory(userId, messages);

            // Extract suggestions/actions
            List<String> suggestions = extractSuggestions(aiResponse);

            return ChatResponse.builder()
                    .message(aiResponse)
                    .suggestions(suggestions)
                    .conversationId(userId)
                    .build();

        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return ChatResponse.builder()
                    .message("I'm sorry, I'm having trouble processing your request. Please try again.")
                    .error(true)
                    .build();
        }
    }

    /**
     * Get conversation history from Redis
     */
    @SuppressWarnings("unchecked")
    private List<ChatMessage> getConversationHistory(String userId) {
        String key = CONVERSATION_KEY_PREFIX + userId;
        List<ChatMessage> history = (List<ChatMessage>) redisTemplate.opsForValue().get(key);

        if (history == null) {
            history = new ArrayList<>();
            // Add system message
            history.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), SYSTEM_PROMPT));
        }

        // Limit history size
        if (history.size() > maxHistory) {
            // Keep system message and recent messages
            List<ChatMessage> trimmed = new ArrayList<>();
            trimmed.add(history.get(0)); // System message
            trimmed.addAll(history.subList(history.size() - maxHistory + 1, history.size()));
            history = trimmed;
        }

        return history;
    }

    /**
     * Save conversation history to Redis
     */
    private void saveConversationHistory(String userId, List<ChatMessage> messages) {
        String key = CONVERSATION_KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, messages, conversationTtl, TimeUnit.SECONDS);
    }

    /**
     * Clear conversation history
     */
    public void clearConversation(String userId) {
        String key = CONVERSATION_KEY_PREFIX + userId;
        redisTemplate.delete(key);
        log.info("Cleared conversation for user: {}", userId);
    }

    /**
     * Extract action suggestions from AI response
     */
    private List<String> extractSuggestions(String response) {
        List<String> suggestions = new ArrayList<>();

        // Simple keyword-based extraction
        if (response.toLowerCase().contains("hotel")) {
            suggestions.add("Search Hotels");
        }
        if (response.toLowerCase().contains("bus")) {
            suggestions.add("Search Buses");
        }
        if (response.toLowerCase().contains("book")) {
            suggestions.add("Make a Booking");
        }

        return suggestions;
    }
}
