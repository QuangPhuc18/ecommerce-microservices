package com.c2c.saga.exception;

public class SagaException extends RuntimeException {
    private final String sagaId;
    private final String step;

    public SagaException(String sagaId, String step, String message) {
        super(message);
        this.sagaId = sagaId;
        this.step = step;
    }

    public SagaException(String sagaId, String step, String message, Throwable cause) {
        super(message, cause);
        this.sagaId = sagaId;
        this.step = step;
    }

    public String getSagaId() {
        return sagaId;
    }

    public String getStep() {
        return step;
    }
}
