package com.c2c.saga.state;

import java.util.Map;
import java.util.Set;

public class SagaStateMachine {

    private static final Map<SagaState, Set<SagaState>> TRANSITIONS = Map.of(
            SagaState.STARTED, Set.of(SagaState.VALIDATING_PRODUCT, SagaState.FAILED),
            SagaState.VALIDATING_PRODUCT, Set.of(SagaState.RESERVING_INVENTORY, SagaState.COMPENSATING),
            SagaState.RESERVING_INVENTORY, Set.of(SagaState.PROCESSING_PAYMENT, SagaState.COMPENSATING),
            SagaState.PROCESSING_PAYMENT, Set.of(SagaState.CREATING_ORDER, SagaState.COMPENSATING),
            SagaState.CREATING_ORDER, Set.of(SagaState.SENDING_NOTIFICATION, SagaState.COMPENSATING),
            SagaState.SENDING_NOTIFICATION, Set.of(SagaState.COMPLETED, SagaState.COMPENSATING),
            SagaState.COMPENSATING, Set.of(SagaState.COMPENSATED, SagaState.FAILED),
            SagaState.COMPENSATED, Set.of(),
            SagaState.COMPLETED, Set.of(),
            SagaState.FAILED, Set.of()
    );

    public static boolean canTransition(SagaState from, SagaState to) {
        Set<SagaState> allowed = TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    public static SagaState nextStep(SagaState current) {
        return switch (current) {
            case STARTED -> SagaState.VALIDATING_PRODUCT;
            case VALIDATING_PRODUCT -> SagaState.RESERVING_INVENTORY;
            case RESERVING_INVENTORY -> SagaState.PROCESSING_PAYMENT;
            case PROCESSING_PAYMENT -> SagaState.CREATING_ORDER;
            case CREATING_ORDER -> SagaState.SENDING_NOTIFICATION;
            case SENDING_NOTIFICATION -> SagaState.COMPLETED;
            default -> current;
        };
    }
}
