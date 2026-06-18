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
public class ValidateProductStep implements SagaStep {

    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "VALIDATE_PRODUCT";
    }

    @Override
    public void execute(SagaInstance instance) {
        try {
            JsonNode payload = objectMapper.readTree(instance.getPayload());
            Long productId = payload.has("productId") ? payload.get("productId").asLong() : null;
            if (productId == null) {
                throw new RuntimeException("Product ID is required");
            }
            log.info("Product validated: productId={}, sagaId={}", productId, instance.getId());
        } catch (Exception e) {
            log.error("Product validation failed: sagaId={}", instance.getId(), e);
            throw new RuntimeException("Product validation failed: " + e.getMessage());
        }
    }

    @Override
    public void compensate(SagaInstance instance) {
        log.info("Compensating product validation: sagaId={}", instance.getId());
    }
}
