package com.c2c.saga.orchestrator;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.repository.SagaInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaOrchestrator {

    private final SagaOrchestrator sagaOrchestrator;
    private final SagaInstanceRepository sagaInstanceRepository;

    public SagaInstance createOrderSaga(Object orderPayload) {
        SagaInstance instance = sagaOrchestrator.startSaga("ORDER_SAGA", orderPayload);
        return sagaOrchestrator.processNextStep(instance);
    }

    public SagaInstance getSagaStatus(String sagaId) {
        return sagaInstanceRepository.findById(java.util.UUID.fromString(sagaId))
                .orElseThrow(() -> new RuntimeException("Saga not found: " + sagaId));
    }
}
