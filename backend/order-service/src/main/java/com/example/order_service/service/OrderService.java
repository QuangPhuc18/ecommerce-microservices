package com.example.order_service.service;

import com.example.order_service.dto.*;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.amqp.rabbit.core.RabbitTemplate; 
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    // Đã xóa khai báo trùng lặp @Autowired, chỉ giữ lại final để dùng chung với @RequiredArgsConstructor
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;    
    private final RabbitTemplate rabbitTemplate; 

    // BƯỚC CHUYỂN ĐỔI EUREKA NẰM Ở ĐÂY:
    // Xóa bỏ @Value (gọi từ cổng localhost cố định) và Gắn trực tiếp Tên Service trên danh bạ
    private final String userServiceUrl = "http://user-service";
    private final String productServiceUrl = "http://product-service";

    // ── HÀM 1: TẠO ĐƠN HÀNG (CÓ BẮN RABBITMQ) ──
    public OrderResponse createOrder(OrderRequest request) {

        log.info("Gọi User Service qua Eureka để lấy thông tin user id={}", request.getUserId());
        // URL lúc này sẽ tự động ghép thành: http://user-service/users/1
        UserDTO user = restTemplate.getForObject(
                userServiceUrl + "/users/" + request.getUserId(),
                UserDTO.class
        );
        if (user == null) {
            throw new RuntimeException("Không tìm thấy user id=" + request.getUserId());
        }

        List<OrderResponse.OrderItemDetail> itemDetails = new ArrayList<>();
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            log.info("Gọi Product Service qua Eureka để lấy product id={}", itemReq.getProductId());

            // URL lúc này sẽ tự động ghép thành: http://product-service/products/1
            ProductDTO product = restTemplate.getForObject(
                    productServiceUrl + "/products/" + itemReq.getProductId(),
                    ProductDTO.class
            );

            if (product == null) {
                throw new RuntimeException("Không tìm thấy product id=" + itemReq.getProductId());
            }

            double subtotal = product.getPrice() * itemReq.getQuantity();
            totalAmount += subtotal;

            orderItems.add(new OrderItem(
                    product.getId(),
                    itemReq.getQuantity(),
                    product.getPrice()
            ));

            itemDetails.add(OrderResponse.OrderItemDetail.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .subtotal(subtotal)
                    .build());
        }

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);

        String message = "Đã tạo thành công đơn hàng số " + saved.getId() + " cho User ID: " + request.getUserId();
        log.info("Gửi thông báo vào RabbitMQ: {}", message);
        rabbitTemplate.convertAndSend("order_queue", message); 

        return OrderResponse.builder()
                .orderId(saved.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .items(itemDetails)
                .totalAmount(totalAmount)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // ── HÀM 2: LẤY ĐƠN HÀNG THEO ID ──
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID = " + id));
    }
    
    // ── HÀM 3: LẤY TẤT CẢ ĐƠN HÀNG ──
    public Iterable<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}