package com.c2c.order.messaging.producer;

import com.c2c.order.model.Order;
import com.c2c.order.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "order.changed";

    public void sendOrderCreatedEvent(Order order) {
        var event = OrderCreatedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
        kafkaTemplate.send(TOPIC, order.getId().toString(), event);
        log.info("Order created event sent: {}", order.getId());
    }

    public void sendOrderStatusChangedEvent(Order order, OrderStatus previousStatus, String note) {
        var event = OrderStatusChangedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .fromStatus(previousStatus)
                .toStatus(order.getStatus())
                .note(note)
                .timestamp(LocalDateTime.now())
                .build();
        kafkaTemplate.send(TOPIC, order.getId().toString(), event);
        log.info("Order status changed event sent: {} -> {}", previousStatus, order.getStatus());
    }

    public record OrderCreatedEvent(
            String eventId,
            UUID orderId,
            String orderNumber,
            UUID buyerId,
            UUID sellerId,
            BigDecimal totalAmount,
            OrderStatus status,
            LocalDateTime createdAt
    ) {
        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String eventId;
            private UUID orderId;
            private String orderNumber;
            private UUID buyerId;
            private UUID sellerId;
            private BigDecimal totalAmount;
            private OrderStatus status;
            private LocalDateTime createdAt;

            Builder() {}

            public Builder eventId(String eventId) { this.eventId = eventId; return this; }
            public Builder orderId(UUID orderId) { this.orderId = orderId; return this; }
            public Builder orderNumber(String orderNumber) { this.orderNumber = orderNumber; return this; }
            public Builder buyerId(UUID buyerId) { this.buyerId = buyerId; return this; }
            public Builder sellerId(UUID sellerId) { this.sellerId = sellerId; return this; }
            public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
            public Builder status(OrderStatus status) { this.status = status; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public OrderCreatedEvent build() {
                return new OrderCreatedEvent(eventId, orderId, orderNumber, buyerId, sellerId, totalAmount, status, createdAt);
            }
        }
    }

    public record OrderStatusChangedEvent(
            String eventId,
            UUID orderId,
            String orderNumber,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            String note,
            LocalDateTime timestamp
    ) {
        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String eventId;
            private UUID orderId;
            private String orderNumber;
            private OrderStatus fromStatus;
            private OrderStatus toStatus;
            private String note;
            private LocalDateTime timestamp;

            Builder() {}

            public Builder eventId(String eventId) { this.eventId = eventId; return this; }
            public Builder orderId(UUID orderId) { this.orderId = orderId; return this; }
            public Builder orderNumber(String orderNumber) { this.orderNumber = orderNumber; return this; }
            public Builder fromStatus(OrderStatus fromStatus) { this.fromStatus = fromStatus; return this; }
            public Builder toStatus(OrderStatus toStatus) { this.toStatus = toStatus; return this; }
            public Builder note(String note) { this.note = note; return this; }
            public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

            public OrderStatusChangedEvent build() {
                return new OrderStatusChangedEvent(eventId, orderId, orderNumber, fromStatus, toStatus, note, timestamp);
            }
        }
    }
}
