package com.c2c.chat.controller;

import com.c2c.chat.dto.MessageRequest;
import com.c2c.chat.dto.MessageResponse;
import com.c2c.chat.messaging.producer.ChatEventProducer;
import com.c2c.chat.service.MessageService;
import com.c2c.chat.service.WebSocketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final WebSocketService webSocketService;
    private final ChatEventProducer chatEventProducer;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(Authentication authentication,
                                                        @Valid @RequestBody MessageRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        MessageResponse response = messageService.sendMessage(userId, request);

        webSocketService.sendMessage(request.getConversationId().toString(), response);
        chatEventProducer.sendMessageSentEvent(response);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getMessages(Authentication authentication,
                                                              @PathVariable UUID conversationId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "50") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(messageService.getMessages(conversationId, userId, page, size));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<Integer> markAsRead(Authentication authentication,
                                               @PathVariable UUID conversationId) {
        UUID userId = (UUID) authentication.getPrincipal();
        int updated = messageService.markAsRead(conversationId, userId);
        return ResponseEntity.ok(updated);
    }
}
