package com.c2c.saga.messaging.consumer;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.SagaOrchestrator;
import com.c2c.saga.repository.SagaInstanceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SagaEventConsumer {

    private final SagaOrchestrator sagaOrchestrator;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.changed", groupId = "saga-orchestrator-group")
    public void handleOrderCreatedEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.has("eventType") ? event.get("eventType").asText() : "";

            if ("ORDER_CREATED".equals(eventType) || event.has("orderId")) {
                log.info("Received order event, starting saga: {}", event);
                SagaInstance instance = sagaOrchestrator.startSaga("ORDER_SAGA", event);
                sagaOrchestrator.processNextStep(instance);
            }
        } catch (Exception e) {
            log.error("Failed to process order event", e);
        }
    }

    @KafkaListener(topics = "payment.changed", groupId = "saga-orchestrator-group")
    public void handlePaymentEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            log.info("Received payment event: {}", event);
        } catch (Exception e) {
            log.error("Failed to process payment event", e);
        }
    }

    @KafkaListener(topics = "saga.events", groupId = "saga-orchestrator-group")
    public void handleSagaEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String sagaId = event.has("sagaId") ? event.get("sagaId").asText() : null;

            if (sagaId != null) {
                SagaInstance instance = sagaInstanceRepository.findById(UUID.fromString(sagaId)).orElse(null);
                if (instance != null && !isTerminalState(instance.getStatus().name())) {
                    sagaOrchestrator.processNextStep(instance);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process saga event", e);
        }
    }

    private boolean isTerminalState(String status) {
        return "COMPLETED".equals(status) || "COMPENSATED".equals(status) || "FAILED".equals(status);
    }
}
