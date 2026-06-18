package com.c2c.saga.step;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.SagaStep;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReserveInventoryStep implements SagaStep {

    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "RESERVE_INVENTORY";
    }

    @Override
    public void execute(SagaInstance instance) {
        try {
            JsonNode payload = objectMapper.readTree(instance.getPayload());
            Long productId = payload.has("productId") ? payload.get("productId").asLong() : null;
            int quantity = payload.has("quantity") ? payload.get("quantity").asInt() : 1;

            log.info("Inventory reserved: productId={}, quantity={}, sagaId={}", productId, quantity, instance.getId());
        } catch (Exception e) {
            log.error("Inventory reservation failed: sagaId={}", instance.getId(), e);
            throw new RuntimeException("Inventory reservation failed: " + e.getMessage());
        }
    }

    @Override
    public void compensate(SagaInstance instance) {
        try {
            JsonNode payload = objectMapper.readTree(instance.getPayload());
            Long productId = payload.has("productId") ? payload.get("productId").asLong() : null;
            int quantity = payload.has("quantity") ? payload.get("quantity").asInt() : 1;

            log.info("Inventory reservation released: productId={}, quantity={}, sagaId={}", productId, quantity, instance.getId());
        } catch (Exception e) {
            log.error("Inventory compensation failed: sagaId={}", instance.getId(), e);
        }
    }
}
