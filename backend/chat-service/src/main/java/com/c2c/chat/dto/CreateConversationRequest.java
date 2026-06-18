package com.c2c.chat.dto;

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
public class CreateConversationRequest {
    @NotNull
    private UUID recipientId;

    private Long listingId;

    private String listingTitle;

    private String initialMessage;
}
