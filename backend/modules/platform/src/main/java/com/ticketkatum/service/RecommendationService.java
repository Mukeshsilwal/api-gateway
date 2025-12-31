package com.ticketkatum.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.dto.RecommendationRequest;
import com.ticketkatum.dto.RecommendationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.Generation;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.temperature:0.7}")
    private Double temperature;

    private static final String SYSTEM_PROMPT = """
            You are an expert travel consultant for Nepal.
            Analyze the user's preferences and generate personalized travel recommendations.

            Return ONLY a valid JSON object with the following structure:
            {
              "title": "A short catchy title for the trip plan",
              "description": "A brief summary of the recommendation",
              "aiAnalysis": "Your expert analysis of why this fits the user",
              "suggestions": [
                {
                  "name": "Name of place/activity",
                  "type": "DESTINATION or ACTIVITY or HOTEL",
                  "description": "Short description",
                  "estimatedCost": "Approximate cost in NPR",
                  "location": "City or Region"
                }
              ]
            }
            Do not include markdown formatting (like ```json), just the raw JSON string.
            """;

    public RecommendationResponse generateRecommendations(RecommendationRequest request) {
        log.info("Generating recommendations for user: {}", request.getUserId());

        try {
            String userPrompt = buildUserPrompt(request);

            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(SYSTEM_PROMPT));
            messages.add(new UserMessage(userPrompt));

            Prompt prompt = new Prompt(messages);
            
            // Note: Spring AI config for model/temp is usually in properties, but can be passed in options if needed.
            // keeping it simple for now, using default configured in properties.

            ChatResponse response = chatClient.call(prompt);
            Generation generation = response.getResult();
            String content = generation.getOutput().getContent();

            // Cleanup markdown if present
            if (content.startsWith("```json")) {
                content = content.substring(7);
            }
            if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }

            return objectMapper.readValue(content.trim(), RecommendationResponse.class);

        } catch (Exception e) {
            log.error("Error generating recommendations", e);
            throw new RuntimeException("Failed to generate recommendations: " + e.getMessage());
        }
    }

    private String buildUserPrompt(RecommendationRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please recommend a trip plan based on the following:");

        if (request.getDestination() != null)
            sb.append("\nDestination: ").append(request.getDestination());
        if (request.getInterests() != null && !request.getInterests().isEmpty())
            sb.append("\nInterests: ").append(String.join(", ", request.getInterests()));
        if (request.getBudgetRange() != null)
            sb.append("\nBudget: ").append(request.getBudgetRange());
        if (request.getTravelType() != null)
            sb.append("\nTravel Type: ").append(request.getTravelType());
        if (request.getDuration() != null)
            sb.append("\nDuration: ").append(request.getDuration());
        if (request.getSeason() != null)
            sb.append("\nSeason: ").append(request.getSeason());

        return sb.toString();
    }
}
