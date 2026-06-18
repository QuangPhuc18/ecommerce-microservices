package com.c2c.saga.step;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.SagaStep;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProcessPaymentStep implements SagaStep {

    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "PROCESS_PAYMENT";
    }

    @Override
    public void execute(SagaInstance instance) {
        try {
            JsonNode payload = objectMapper.readTree(instance.getPayload());
            BigDecimal amount = payload.has("amount") ? new BigDecimal(payload.get("amount").asText()) : null;

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Invalid payment amount");
            }

            log.info("Payment processed: amount={}, sagaId={}", amount, instance.getId());
        } catch (Exception e) {
            log.error("Payment processing failed: sagaId={}", instance.getId(), e);
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    @Override
    public void compensate(SagaInstance instance) {
        try {
            JsonNode payload = objectMapper.readTree(instance.getPayload());
            BigDecimal amount = payload.has("amount") ? new BigDecimal(payload.get("amount").asText()) : null;

            log.info("Payment refunded: amount={}, sagaId={}", amount, instance.getId());
        } catch (Exception e) {
            log.error("Payment compensation failed: sagaId={}", instance.getId(), e);
        }
    }
}
