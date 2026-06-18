package com.example.chat_service.dto;

import com.example.chat_service.entity.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatMessageRequest {
    @NotBlank(message = "Content cannot be blank")
    private String content;

    private MessageType messageType = MessageType.TEXT;
}
