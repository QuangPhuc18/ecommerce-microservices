package com.c2c.saga.messaging.producer;

import com.c2c.saga.model.SagaOutbox;
import com.c2c.saga.repository.SagaOutboxRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SagaEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final SagaOutboxRepository sagaOutboxRepository;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedRate = 5000)
    public void processOutbox() {
        List<SagaOutbox> pendingEvents = sagaOutboxRepository.findByStatus("PENDING");
        for (SagaOutbox outbox : pendingEvents) {
            try {
                String topic = mapEventTypeToTopic(outbox.getEventType());
                JsonNode payload = objectMapper.readTree(outbox.getPayload());
                kafkaTemplate.send(topic, outbox.getSagaInstanceId().toString(), payload);

                outbox.setStatus("SENT");
                outbox.setSentAt(LocalDateTime.now());
                sagaOutboxRepository.save(outbox);
                log.info("Outbox event sent: id={}, topic={}", outbox.getId(), topic);
            } catch (Exception e) {
                log.error("Failed to send outbox event: id={}", outbox.getId(), e);
            }
        }
    }

    public void sendEvent(String topic, String key, Object event) {
        kafkaTemplate.send(topic, key, event);
    }

    private String mapEventTypeToTopic(String eventType) {
        return switch (eventType) {
            case "SAGA_STARTED" -> "saga.events";
            case "SAGA_COMPLETED" -> "saga.events";
            case "SAGA_COMPENSATED" -> "saga.events";
            case "STEP_COMPLETED:VALIDATE_PRODUCT" -> "saga.events";
            case "STEP_COMPLETED:RESERVE_INVENTORY" -> "inventory.reserve";
            case "STEP_COMPLETED:PROCESS_PAYMENT" -> "payment.required";
            case "STEP_COMPLETED:CREATE_ORDER" -> "order.confirmed";
            case "STEP_COMPLETED:SEND_NOTIFICATION" -> "notification.send";
            case "STEP_COMPENSATED:RESERVE_INVENTORY" -> "inventory.release";
            case "STEP_COMPENSATED:PROCESS_PAYMENT" -> "payment.refund";
            default -> "saga.events";
        };
    }
}
