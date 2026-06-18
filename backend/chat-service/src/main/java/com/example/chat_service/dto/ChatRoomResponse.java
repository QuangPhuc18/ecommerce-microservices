package com.example.chat_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatRoomResponse {
    private Long id;
    private Long buyerId;
    private Long sellerId;
    private Long productId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastMessage;
    private int unreadCount;
}
