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
public class ProductEvent implements Serializable {
    private String eventId;
    private String eventType;
    private Long productId;
    private String productName;
    private Long sellerId;
    private String sellerName;
    private BigDecimal price;
    private String status;
    private LocalDateTime timestamp;
}
