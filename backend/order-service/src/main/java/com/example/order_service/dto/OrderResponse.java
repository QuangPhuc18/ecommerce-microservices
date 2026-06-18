package com.example.order_service.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;

    // Thông tin người dùng
    private Long userId;
    private String userName;
    private String userEmail;

    // Danh sách sản phẩm đã đặt
    private List<OrderItemDetail> items;

    // Tổng tiền
    private Double totalAmount;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class OrderItemDetail {
        private Long productId;
        private String productName;
        private Double unitPrice;
        private Integer quantity;
        private Double subtotal;
    }
}