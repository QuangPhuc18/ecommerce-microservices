package com.c2c.payment.messaging.consumer;

import com.c2c.payment.dto.PaymentCreateRequest;
import com.c2c.payment.model.PaymentMethod;
import com.c2c.payment.service.PaymentService;
import com.c2c.shared.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {
    private final PaymentService paymentService;

    @KafkaListener(topics = "order.changed", groupId = "payment-service-group")
    public void handleOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Received order created event: {}", event.getOrderId());

        if (event.getOrderCode() != null && event.getOrderCode().contains("COD")) {
            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .orderId(java.util.UUID.randomUUID())
                    .amount(event.getAmount())
                    .currency(event.getCurrency())
                    .method(PaymentMethod.COD)
                    .build();
            paymentService.processPayment(request);
            log.info("Auto-processed COD payment for order: {}", event.getOrderId());
        }
    }
}
