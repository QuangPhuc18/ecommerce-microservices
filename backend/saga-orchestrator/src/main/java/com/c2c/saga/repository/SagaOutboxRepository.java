package com.c2c.saga.repository;

import com.c2c.saga.model.SagaOutbox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SagaOutboxRepository extends JpaRepository<SagaOutbox, UUID> {
    List<SagaOutbox> findByStatus(String status);
    List<SagaOutbox> findBySagaInstanceId(UUID sagaInstanceId);
}
