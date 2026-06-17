package com.c2c.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponse {
    private List<OrderResponse> orders;
    private int totalPages;
    private long totalElements;
}
