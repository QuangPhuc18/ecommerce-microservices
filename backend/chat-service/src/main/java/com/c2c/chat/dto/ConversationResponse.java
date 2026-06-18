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
public class ConversationResponse {
    private UUID id;
    private Long listingId;
    private String listingTitle;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private UUID otherUserId;
    private LocalDateTime createdAt;
}
