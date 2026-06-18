package com.c2c.saga.controller;

import com.c2c.saga.model.SagaInstance;
import com.c2c.saga.orchestrator.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sagas")
@RequiredArgsConstructor
public class SagaController {

    private final OrderSagaOrchestrator orderSagaOrchestrator;

    @PostMapping("/orders")
    public ResponseEntity<SagaInstance> startOrderSaga(@RequestBody Map<String, Object> payload) {
        SagaInstance instance = orderSagaOrchestrator.createOrderSaga(payload);
        return ResponseEntity.ok(instance);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SagaInstance> getSagaStatus(@PathVariable String id) {
        SagaInstance instance = orderSagaOrchestrator.getSagaStatus(id);
        return ResponseEntity.ok(instance);
    }
}
