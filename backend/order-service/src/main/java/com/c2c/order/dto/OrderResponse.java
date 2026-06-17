package com.c2c.order.dto;

import com.c2c.order.model.OrderItem;
import com.c2c.order.model.OrderStatus;
import com.c2c.order.model.ShippingAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private UUID buyerId;
    private UUID sellerId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private ShippingAddress shippingAddress;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItem> items;
}
