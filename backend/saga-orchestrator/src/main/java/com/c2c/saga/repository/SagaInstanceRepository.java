package com.c2c.saga.repository;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.state.SagaState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SagaInstanceRepository extends JpaRepository<SagaInstance, UUID> {
    List<SagaInstance> findByStatus(SagaState status);
    List<SagaInstance> findBySagaTypeAndStatus(String sagaType, SagaState status);
}
