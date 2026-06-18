package com.c2c.payment.messaging.producer;

import com.c2c.payment.model.Payment;
import com.c2c.shared.event.PaymentProcessedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "payment.changed";

    public void sendPaymentProcessedEvent(Payment payment) {
        var event = PaymentProcessedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(payment.getOrderId().getMostSignificantBits() & Long.MAX_VALUE)
                .transactionCode(payment.getTransactionId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .processedAt(payment.getUpdatedAt())
                .build();
        kafkaTemplate.send(TOPIC, payment.getId().toString(), event);
        log.info("Payment processed event sent: {}", payment.getId());
    }
}
