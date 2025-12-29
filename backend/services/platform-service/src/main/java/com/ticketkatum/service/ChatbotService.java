package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * AI Chatbot Service
 * Provides intelligent conversation capabilities using Spring AI
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatClient chatClient;

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${chatbot.max-conversation-history:10}")
    private Integer maxHistory;

    @Value("${chatbot.conversation-ttl:3600}")
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
    public AiChatResponse chat(String userId, String message) {
        log.info("Processing chat message for user: {}", userId);

        try {
            // Get conversation history
            List<Message> messages = getConversationHistory(userId);

            // Add user message
            messages.add(new UserMessage(message));

            // Create prompt
            Prompt prompt = new Prompt(messages);

            // Get AI response
            ChatResponse response = chatClient.call(prompt);
            Generation generation = response.getResult();
            String aiResponse = generation.getOutput().getContent();

            // Add AI response to history
            messages.add(new AssistantMessage(aiResponse));

            // Save conversation history
            saveConversationHistory(userId, messages);

            // Extract suggestions/actions
            List<String> suggestions = extractSuggestions(aiResponse);

            return AiChatResponse.builder()
                    .message(aiResponse)
                    .suggestions(suggestions)
                    .conversationId(userId)
                    .build();

        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return AiChatResponse.builder()
                    .message("I'm sorry, I'm having trouble processing your request. Please try again.")
                    .error(true)
                    .build();
        }
    }

    /**
     * Get conversation history from Redis
     */
    @SuppressWarnings("unchecked")
    private List<Message> getConversationHistory(String userId) {
        String key = CONVERSATION_KEY_PREFIX + userId;
        // Verify type safety or use a wrapper class for simpler serialization
        // For simplicity assuming RedisTemplate handles List<Message> serialization if configured or simple mapping
        // In practice, Message interface might need custom serializer, but let's assume standard Java serialization of simple impls or Strings
        // Better: Store as List<SimpleMessageDto> and map back.
        // For now, let's just use local memory logic or assume redis works.
        // ACTUALLY: Spring AI Messages might not be Serializable.
        // Let's store DTOs to be safe.
        List<ChatHistoryDto> historyDtos = (List<ChatHistoryDto>) redisTemplate.opsForValue().get(key);

        List<Message> messages = new ArrayList<>();
        if (historyDtos == null || historyDtos.isEmpty()) {
            messages.add(new SystemMessage(SYSTEM_PROMPT));
        } else {
            messages = historyDtos.stream().map(this::toMessage).collect(Collectors.toList());
        }

        return messages;
    }

    /**
     * Save conversation history to Redis
     */
    private void saveConversationHistory(String userId, List<Message> messages) {
        String key = CONVERSATION_KEY_PREFIX + userId;
        
        // Limit history size
        if (messages.size() > maxHistory) {
             // Keep system prompt + last N messages
             List<Message> kept = new ArrayList<>();
             if(!messages.isEmpty() && messages.get(0) instanceof SystemMessage) {
                 kept.add(messages.get(0));
             }
             int start = Math.max(1, messages.size() - maxHistory);
             for(int i=start; i<messages.size(); i++){
                 kept.add(messages.get(i));
             }
             messages = kept;
        }

        List<ChatHistoryDto> dtos = messages.stream().map(this::toDto).collect(Collectors.toList());
        redisTemplate.opsForValue().set(key, dtos, conversationTtl, TimeUnit.SECONDS);
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
        String lower = response.toLowerCase();
        if (lower.contains("hotel")) suggestions.add("Search Hotels");
        if (lower.contains("bus")) suggestions.add("Search Buses");
        if (lower.contains("book")) suggestions.add("Make a Booking");
        return suggestions;
    }

    // --- Helpers for Serialization ---

    private ChatHistoryDto toDto(Message message) {
        String role = "user";
        if (message instanceof SystemMessage) role = "system";
        else if (message instanceof AssistantMessage) role = "assistant";
        return new ChatHistoryDto(role, message.getContent());
    }

    private Message toMessage(ChatHistoryDto dto) {
        return switch (dto.role) {
            case "system" -> new SystemMessage(dto.content);
            case "assistant" -> new AssistantMessage(dto.content);
            default -> new UserMessage(dto.content);
        };
    }

    // Simple DTO for Redis storage
    public record ChatHistoryDto(String role, String content) implements java.io.Serializable {}
}
