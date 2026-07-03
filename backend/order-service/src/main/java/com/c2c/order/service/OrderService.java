package com.c2c.order.service;

import com.c2c.order.dto.*;
import com.c2c.order.messaging.producer.OrderEventProducer;
import com.c2c.order.model.Order;
import com.c2c.order.model.OrderHistory;
import com.c2c.order.model.OrderItem;
import com.c2c.order.model.OrderStatus;
import com.c2c.order.repository.OrderHistoryRepository;
import com.c2c.order.repository.OrderRepository;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final OrderEventProducer orderEventProducer;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new HashMap<>();

    static {
        VALID_TRANSITIONS.put(OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.CONFIRMED, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.DELIVERED, Set.of(OrderStatus.REFUNDED));
        VALID_TRANSITIONS.put(OrderStatus.CANCELLED, Collections.emptySet());
        VALID_TRANSITIONS.put(OrderStatus.REFUNDED, Collections.emptySet());
    }

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, UUID buyerId) {
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .buyerId(buyerId)
                .sellerId(UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .shippingAddress(request.getShippingAddress())
                .items(new ArrayList<>())
                .build();

        OrderItem item = OrderItem.builder()
                .order(order)
                .productId(request.getProductId())
                .productTitle("Unknown")
                .quantity(request.getQuantity())
                .price(BigDecimal.ZERO)
                .subtotal(BigDecimal.ZERO)
                .build();
        order.getItems().add(item);

        order = orderRepository.save(order);

        orderHistoryRepository.save(OrderHistory.builder()
                .orderId(order.getId())
                .toStatus(OrderStatus.PENDING)
                .changedBy(buyerId.toString())
                .note("Order created")
                .build());

        orderEventProducer.sendOrderCreatedEvent(order);
        return toResponse(order);
    }

    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        return toResponse(order);
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        return toResponse(order);
    }

    public OrderListResponse getOrdersByBuyer(UUID buyerId, int page, int size) {
        Page<Order> orderPage = orderRepository.findByBuyerId(buyerId, PageRequest.of(page, size));
        return toListResponse(orderPage);
    }

    public OrderListResponse getAllOrders(int page, int size) {
        Page<Order> orderPage = orderRepository.findAll(PageRequest.of(page, size));
        return toListResponse(orderPage);
    }

    public OrderListResponse getOrdersBySeller(UUID sellerId, int page, int size) {
        Page<Order> orderPage = orderRepository.findBySellerId(sellerId, PageRequest.of(page, size));
        return toListResponse(orderPage);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request, UUID changedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus newStatus = request.getStatus();
        OrderStatus currentStatus = order.getStatus();

        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS,
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        order = orderRepository.save(order);

        orderHistoryRepository.save(OrderHistory.builder()
                .orderId(order.getId())
                .fromStatus(previousStatus)
                .toStatus(newStatus)
                .changedBy(changedBy.toString())
                .note(request.getNote())
                .build());

        orderEventProducer.sendOrderStatusChangedEvent(order, previousStatus, request.getNote());
        return toResponse(order);
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems())
                .build();
    }

    private OrderListResponse toListResponse(Page<Order> page) {
        List<OrderResponse> orders = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return OrderListResponse.builder()
                .orders(orders)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
    }
}
