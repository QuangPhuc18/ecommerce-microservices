package com.c2c.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {
    @NotNull
    private UUID conversationId;

    @NotBlank
    private String content;

    private String messageType;

    private String clientGeneratedId;
}
