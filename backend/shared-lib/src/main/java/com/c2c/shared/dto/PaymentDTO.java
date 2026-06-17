package com.c2c.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO implements Serializable {
    private Long id;
    private String transactionCode;
    private Long orderId;
    private String orderCode;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private String gatewayTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
