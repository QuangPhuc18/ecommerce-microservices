package com.c2c.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String content;
    private String messageType;
    private boolean isRead;
    private String clientGeneratedId;
    private LocalDateTime createdAt;
}
