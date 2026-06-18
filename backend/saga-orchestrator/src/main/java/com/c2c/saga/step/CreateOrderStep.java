package com.c2c.saga.step;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.SagaStep;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CreateOrderStep implements SagaStep {

    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "CREATE_ORDER";
    }

    @Override
    public void execute(SagaInstance instance) {
        try {
            log.info("Order created: sagaId={}", instance.getId());
        } catch (Exception e) {
            log.error("Order creation failed: sagaId={}", instance.getId(), e);
            throw new RuntimeException("Order creation failed: " + e.getMessage());
        }
    }

    @Override
    public void compensate(SagaInstance instance) {
        log.info("Order cancelled: sagaId={}", instance.getId());
    }
}
