package com.c2c.payment.dto;

import com.c2c.payment.model.TransactionStatus;
import com.c2c.payment.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private UUID id;
    private UUID walletId;
    private UUID userId;
    private TransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private UUID orderId;
    private String reference;
    private TransactionStatus status;
    private String description;
    private LocalDateTime createdAt;
}
