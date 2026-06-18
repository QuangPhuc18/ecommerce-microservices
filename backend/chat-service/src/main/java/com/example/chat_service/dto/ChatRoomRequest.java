package com.example.chat_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRoomRequest {
    @NotNull(message = "Seller ID cannot be null")
    private Long sellerId;

    private Long productId;
}
