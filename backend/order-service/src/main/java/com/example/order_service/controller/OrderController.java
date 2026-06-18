package com.example.order_service.controller;

import com.example.order_service.dto.OrderRequest;
import com.example.order_service.dto.OrderResponse;
import com.example.order_service.entity.Order; // Bổ sung import Entity
import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    // ── Phương thức GET: Lấy thông tin đơn hàng theo ID ──
  @GetMapping("/{id}")
public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
    return ResponseEntity.ok(orderService.getOrderById(id));
}
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }
  // HÀM 3: API lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<Iterable<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}