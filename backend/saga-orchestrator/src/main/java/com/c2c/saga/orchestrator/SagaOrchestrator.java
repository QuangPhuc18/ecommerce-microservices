package com.c2c.saga.orchestrator;

import com.c2c.saga.exception.SagaException;
import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.model.SagaOutbox;
import com.c2c.saga.repository.SagaInstanceRepository;
import com.c2c.saga.repository.SagaOutboxRepository;
import com.c2c.saga.state.SagaState;
import com.c2c.saga.state.SagaStateMachine;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SagaOrchestrator {

    private final SagaInstanceRepository sagaInstanceRepository;
    private final SagaOutboxRepository sagaOutboxRepository;
    private final CompensationRegistry compensationRegistry;
    private final ObjectMapper objectMapper;

    @Transactional
    public SagaInstance startSaga(String sagaType, Object payload) {
        SagaInstance instance = SagaInstance.builder()
                .sagaType(sagaType)
                .status(SagaState.STARTED)
                .currentStep(0)
                .totalSteps(getStepsForSaga(sagaType).size())
                .payload(toJson(payload))
                .build();
        instance = sagaInstanceRepository.save(instance);

        persistOutbox(instance, "SAGA_STARTED", payload);
        log.info("Saga started: id={}, type={}", instance.getId(), sagaType);
        return instance;
    }

    @Transactional
    public SagaInstance processNextStep(SagaInstance instance) {
        List<SagaStep> steps = getStepsForSaga(instance.getSagaType());

        if (instance.getCurrentStep() >= steps.size()) {
            instance.setStatus(SagaState.COMPLETED);
            instance.setCompletedAt(LocalDateTime.now());
            sagaInstanceRepository.save(instance);
            persistOutbox(instance, "SAGA_COMPLETED", null);
            log.info("Saga completed: id={}", instance.getId());
            return instance;
        }

        SagaStep currentStep = steps.get(instance.getCurrentStep());
        SagaState expectedState = SagaStateMachine.nextStep(instance.getStatus());

        if (!SagaStateMachine.canTransition(instance.getStatus(), expectedState)) {
            throw new SagaException(instance.getId().toString(), currentStep.getName(),
                    "Invalid transition: " + instance.getStatus() + " -> " + expectedState);
        }

        instance.setStatus(expectedState);
        sagaInstanceRepository.save(instance);

        try {
            currentStep.execute(instance);
            instance.setCurrentStep(instance.getCurrentStep() + 1);
            sagaInstanceRepository.save(instance);
            persistOutbox(instance, "STEP_COMPLETED:" + currentStep.getName(), null);
            log.info("Step completed: saga={}, step={}", instance.getId(), currentStep.getName());
        } catch (Exception e) {
            log.error("Step failed: saga={}, step={}, error={}", instance.getId(), currentStep.getName(), e.getMessage());
            instance.setStatus(SagaState.COMPENSATING);
            sagaInstanceRepository.save(instance);
            compensate(instance, instance.getCurrentStep());
            return instance;
        }

        return processNextStep(instance);
    }

    private void compensate(SagaInstance instance, int failedStepIndex) {
        List<SagaStep> steps = getStepsForSaga(instance.getSagaType());

        for (int i = failedStepIndex - 1; i >= 0; i--) {
            SagaStep step = steps.get(i);
            try {
                step.compensate(instance);
                persistOutbox(instance, "STEP_COMPENSATED:" + step.getName(), null);
                log.info("Step compensated: saga={}, step={}", instance.getId(), step.getName());
            } catch (Exception e) {
                log.error("Compensation failed: saga={}, step={}, error={}", instance.getId(), step.getName(), e.getMessage());
            }
        }

        instance.setStatus(SagaState.COMPENSATED);
        instance.setFailedAt(LocalDateTime.now());
        instance.setFailureReason("Failed at step: " + steps.get(failedStepIndex).getName());
        sagaInstanceRepository.save(instance);
        persistOutbox(instance, "SAGA_COMPENSATED", null);
        log.info("Saga compensated: id={}", instance.getId());
    }

    private void persistOutbox(SagaInstance instance, String eventType, Object payload) {
        SagaOutbox outbox = SagaOutbox.builder()
                .sagaInstanceId(instance.getId())
                .eventType(eventType)
                .payload(toJson(payload != null ? payload : Map.of("sagaId", instance.getId(), "status", instance.getStatus())))
                .build();
        sagaOutboxRepository.save(outbox);
    }

    private List<SagaStep> getStepsForSaga(String sagaType) {
        return switch (sagaType) {
            case "ORDER_SAGA" -> compensationRegistry.getOrderSagaSteps();
            default -> throw new IllegalArgumentException("Unknown saga type: " + sagaType);
        };
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payload", e);
            return "{}";
        }
    }
}
