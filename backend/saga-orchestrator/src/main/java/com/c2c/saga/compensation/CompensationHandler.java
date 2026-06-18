package com.c2c.saga.compensation;

import com.c2c.saga.model.SagaInstance;

public interface CompensationHandler {
    void compensate(SagaInstance instance);
}
