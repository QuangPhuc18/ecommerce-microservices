package com.c2c.saga.compensation;

import com.c2c.saga.orchestrator.SagaStep;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter
public class CompensationRegistry {

    private final List<SagaStep> orderSagaSteps;

    public CompensationRegistry(
            com.c2c.saga.step.ValidateProductStep validateProductStep,
            com.c2c.saga.step.ReserveInventoryStep reserveInventoryStep,
            com.c2c.saga.step.ProcessPaymentStep processPaymentStep,
            com.c2c.saga.step.CreateOrderStep createOrderStep,
            com.c2c.saga.step.SendNotificationStep sendNotificationStep) {
        this.orderSagaSteps = List.of(
                validateProductStep,
                reserveInventoryStep,
                processPaymentStep,
                createOrderStep,
                sendNotificationStep
        );
    }
}
