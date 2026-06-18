package com.c2c.chat.controller;

import com.c2c.chat.dto.ConversationResponse;
import com.c2c.chat.dto.CreateConversationRequest;
import com.c2c.chat.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(Authentication authentication,
                                                                    @Valid @RequestBody CreateConversationRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.createConversation(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<ConversationResponse>> getConversations(Authentication authentication,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "20") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(conversationService.getConversations(userId, page, size));
    }
}
