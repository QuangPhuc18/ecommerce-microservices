package com.c2c.saga.step;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.SagaStep;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SendNotificationStep implements SagaStep {

    @Override
    public String getName() {
        return "SEND_NOTIFICATION";
    }

    @Override
    public void execute(SagaInstance instance) {
        try {
            log.info("Notification sent: sagaId={}", instance.getId());
        } catch (Exception e) {
            log.error("Notification failed: sagaId={}", instance.getId(), e);
            throw new RuntimeException("Notification failed: " + e.getMessage());
        }
    }

    @Override
    public void compensate(SagaInstance instance) {
        log.info("Notification compensation (not required): sagaId={}", instance.getId());
    }
}
