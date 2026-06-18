package com.c2c.saga.model;

import com.c2c.saga.state.SagaState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saga_instances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SagaInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String sagaType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SagaState status;

    @Column(nullable = false)
    @Builder.Default
    private int currentStep = 0;

    @Column(nullable = false)
    private int totalSteps;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime failedAt;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) status = SagaState.STARTED;
    }
}
