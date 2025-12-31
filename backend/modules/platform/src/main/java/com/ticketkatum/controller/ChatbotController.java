package com.ticketkatum.controller;

import com.ticketkatum.service.AiChatResponse;
import com.ticketkatum.service.ChatbotService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI Chatbot Controller
 * Provides REST API for chatbot interactions
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai/chat")
@RequiredArgsConstructor
public class ChatbotController {

        private final ChatbotService chatbotService;

        @PostMapping
        public ResponseEntity<Response<AiChatResponse>> chat(
                        @RequestHeader("X-User-Id") String userId,
                        @RequestBody ChatRequest request) {
                log.info("Chat request from user: {} - message: {}", userId, request.message());

                AiChatResponse chatResponse = chatbotService.chat(userId, request.message());

                return ResponseEntity.ok(
                                ResponseHandler.success("Chat response generated", chatResponse));
        }

        @Operation(summary = "Clear conversation", description = "Clear conversation history for a user")
        @DeleteMapping("/conversation")
        public ResponseEntity<Response<Void>> clearConversation(
                        @RequestHeader("X-User-Id") String userId) {
                log.info("Clearing conversation for user: {}", userId);

                chatbotService.clearConversation(userId);

                return ResponseEntity.ok(
                                ResponseHandler.success("Conversation cleared", null));
        }

        /**
         * Chat request DTO
         */
        public record ChatRequest(String message) {
        }
}
