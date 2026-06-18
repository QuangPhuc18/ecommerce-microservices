package com.c2c.saga.orchestrator;

import com.c2c.saga.model.SagaInstance;

public interface SagaStep {
    String getName();
    void execute(SagaInstance instance);
    void compensate(SagaInstance instance);
}
