package com.c2c.order.controller;

import com.c2c.order.dto.OrderListResponse;
import com.c2c.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<OrderListResponse> getSellerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID sellerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.getOrdersBySeller(sellerId, page, size));
    }
}
