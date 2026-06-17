package com.c2c.shared.event;

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
public class PaymentProcessedEvent implements Serializable {
    private String eventId;
    private Long transactionId;
    private String transactionCode;
    private Long orderId;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime processedAt;
}
