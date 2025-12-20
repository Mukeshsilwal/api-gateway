package com.ticketkatum.controller;

import com.ticketkatum.client.AiServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.ai.ChatRequest;
import com.ticketkatum.dto.ai.ChatResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * AI BFF Controller
 * Proxies AI chatbot requests to AI Service
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "AI-powered chatbot and smart features")
public class AiBffController {

    private final AiServiceClient aiServiceClient;

    @Operation(summary = "Chat with AI assistant", description = "Send a message to the AI travel assistant and get personalized help")
    @PostMapping("/chat")
    public CompletableFuture<ResponseEntity<Response<ChatResponse>>> chat(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ChatRequest request) {
        log.info("Chat request from user: {}", userId);

        return aiServiceClient.chat(userId, request.message())
                .thenApply(chatResponse -> {
                    Response<ChatResponse> response = Response.<ChatResponse>builder()
                            .statusCode(200)
                            .message("Chat response generated")
                            .data(chatResponse)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error processing chat request", ex);

                    ChatResponse errorResponse = ChatResponse.builder()
                            .message("I'm having trouble right now. Please try again.")
                            .error(true)
                            .build();

                    Response<ChatResponse> response = Response.<ChatResponse>builder()
                            .statusCode(500)
                            .message("Chat service temporarily unavailable")
                            .data(errorResponse)
                            .build();

                    return ResponseEntity.status(500).body(response);
                });
    }

    @Operation(summary = "Clear conversation", description = "Clear conversation history and start fresh")
    @DeleteMapping("/chat/conversation")
    public CompletableFuture<ResponseEntity<Response<Void>>> clearConversation(
            @RequestHeader("X-User-Id") String userId) {
        log.info("Clearing conversation for user: {}", userId);

        return aiServiceClient.clearConversation(userId)
                .thenApply(v -> {
                    Response<Void> response = Response.<Void>builder()
                            .statusCode(200)
                            .message("Conversation cleared successfully")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error clearing conversation", ex);

                    Response<Void> response = Response.<Void>builder()
                            .statusCode(500)
                            .message("Failed to clear conversation")
                            .build();

                    return ResponseEntity.status(500).body(response);
                });
    }
}
