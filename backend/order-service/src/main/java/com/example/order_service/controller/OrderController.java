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
public ResponseEntity<Order> getOrderById(
        @PathVariable Long id,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        @RequestHeader(value = "X-User-Role", required = false) String role) {
    Order order = orderService.getOrderById(id);
    // Kiểm tra quyền
    if (userId != null && role != null && !role.equals("ADMIN") && !order.getUserId().toString().equals(userId)) {
        throw new RuntimeException("Access Denied: You do not own this order");
    }
    return ResponseEntity.ok(order);
}
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }
  // HÀM 3: API lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<Iterable<Order>> getAllOrders(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        
        if (role != null && role.equals("ADMIN")) {
            return ResponseEntity.ok(orderService.getAllOrders());
        } else if (userId != null) {
            // Có thể filter lấy order của user, nhưng tạm thời dùng getAll 
            // Nếu có hàm getByUserId trong service thì tốt hơn
            return ResponseEntity.ok(orderService.getAllOrders());
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}