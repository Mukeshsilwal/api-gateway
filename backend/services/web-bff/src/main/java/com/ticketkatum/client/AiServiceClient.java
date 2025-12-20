package com.ticketkatum.client;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.ai.ChatRequest;
import com.ticketkatum.dto.ai.ChatResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.concurrent.CompletableFuture;

/**
 * Client for AI Service
 * Handles chatbot and AI-powered features
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.ai-service.url:http://localhost:8085}")
    private String aiServiceUrl;

    private static final String SERVICE_NAME = "ai-service";
    private static final String CIRCUIT_BREAKER_NAME = "aiService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(aiServiceUrl)
                .build();
    }

    /**
     * Send chat message to AI chatbot
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "chatFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<ChatResponse> chat(String userId, String message) {
        log.debug("Sending chat message for user: {}", userId);

        ChatRequest request = new ChatRequest(message);

        return getWebClient()
                .post()
                .uri("/api/v1/ai/chat")
                .header("X-User-Id", userId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> {
                    // Convert response data to ChatResponse
                    var data = response.getData();
                    if (data instanceof ChatResponse) {
                        return (ChatResponse) data;
                    }
                    // Handle map conversion
                    return convertToChatResponse(data);
                })
                .toFuture();
    }

    /**
     * Clear conversation history
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Void> clearConversation(String userId) {
        log.debug("Clearing conversation for user: {}", userId);

        return getWebClient()
                .delete()
                .uri("/api/v1/ai/chat/conversation")
                .header("X-User-Id", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }

    /**
     * Fallback method for chat
     */
    private CompletableFuture<ChatResponse> chatFallback(String userId, String message, Throwable ex) {
        log.warn("Fallback: chat for user: {} - {}", userId, ex.getMessage());

        return CompletableFuture.completedFuture(
                ChatResponse.builder()
                        .message("I'm currently unavailable. Please try again in a moment.")
                        .suggestions(Collections.emptyList())
                        .error(true)
                        .build());
    }

    /**
     * Convert map to ChatResponse
     */
    @SuppressWarnings("unchecked")
    private ChatResponse convertToChatResponse(Object data) {
        if (data instanceof java.util.Map) {
            java.util.Map<String, Object> map = (java.util.Map<String, Object>) data;
            return ChatResponse.builder()
                    .message((String) map.get("message"))
                    .suggestions((java.util.List<String>) map.getOrDefault("suggestions", Collections.emptyList()))
                    .conversationId((String) map.get("conversationId"))
                    .error((Boolean) map.getOrDefault("error", false))
                    .build();
        }
        throw new IllegalArgumentException("Cannot convert data to ChatResponse");
    }
}
