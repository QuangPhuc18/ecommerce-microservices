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
public class OrderCreatedEvent implements Serializable {
    private String eventId;
    private Long orderId;
    private String orderCode;
    private Long buyerId;
    private Long sellerId;
    private Long productId;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createdAt;
}
