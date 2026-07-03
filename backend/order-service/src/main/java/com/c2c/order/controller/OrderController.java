package com.c2c.order.controller;

import com.c2c.order.dto.OrderCreateRequest;
import com.c2c.order.dto.OrderListResponse;
import com.c2c.order.dto.OrderResponse;
import com.c2c.order.dto.OrderStatusUpdateRequest;
import com.c2c.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request,
                                                      Authentication authentication) {
        UUID buyerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, buyerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByOrderNumber(orderNumber));
    }

    @GetMapping
    public ResponseEntity<OrderListResponse> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID buyerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.getOrdersByBuyer(buyerId, page, size));
    }

    @GetMapping("/admin")
    public ResponseEntity<OrderListResponse> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable UUID id,
                                                            @Valid @RequestBody OrderStatusUpdateRequest request,
                                                            Authentication authentication) {
        UUID changedBy = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request, changedBy));
    }
}
