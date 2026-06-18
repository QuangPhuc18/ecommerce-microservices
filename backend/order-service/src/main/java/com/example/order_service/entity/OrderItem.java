package com.example.order_service.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private Long productId;
    private Integer quantity;
    private Double unitPrice;
}