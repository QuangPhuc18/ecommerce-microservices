package com.example.chat_service.dto;

import com.example.chat_service.entity.MessageType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private String content;
    private MessageType messageType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
