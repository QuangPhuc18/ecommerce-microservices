# 09 — Saga Orchestration Flow

## Tổng quan

Distributed transaction pattern cho luồng đặt hàng — đảm bảo consistency giữa nhiều microservices với cơ chế compensation.

**Services tham gia:**
- `saga-orchestrator` (port 8010) — orchestrator trung tâm
- `order-service` (port 8005) — tạo đơn hàng
- `payment-service` (port 8006) — xử lý thanh toán
- `product-service` (port 8003) — validate sản phẩm
- `notification-service` (port 8008) — gửi thông báo

**Database:** `saga_db` PostgreSQL — `saga_instances`, `saga_outbox`
**Kafka topics:** `saga.events`, `order.changed`, `payment.changed`, `inventory.reserve`, `payment.required`, `order.confirmed`, `notification.send`

---

## 1. Saga Flow Tổng Quan

```mermaid
sequenceDiagram
    participant OrderSvc as order-service
    participant Kafka
    participant Saga as saga-orchestrator
    participant DB as saga_db

    OrderSvc->>Kafka: order.changed (ORDER_CREATED)

    Kafka->>Saga: SagaEventConsumer receives
    Saga->>Saga: SagaOrchestrator.startSaga()
    Saga->>DB: INSERT saga_instances (STARTED)
    Saga->>Saga: processNextStep()

    Note over Saga: === Bước 1: VALIDATE_PRODUCT ===
    Saga->>DB: UPDATE saga (VALIDATING_PRODUCT)
    Saga->>Saga: ValidateProductStep.execute()
    Saga->>DB: INSERT saga_outbox (STEP_COMPLETED:VALIDATE_PRODUCT)

    Note over Saga: === Bước 2: RESERVE_INVENTORY ===
    Saga->>DB: UPDATE saga (RESERVING_INVENTORY)
    Saga->>Saga: ReserveInventoryStep.execute()
    Saga->>DB: INSERT saga_outbox

    Note over Saga: === Bước 3: PROCESS_PAYMENT ===
    Saga->>DB: UPDATE saga (PROCESSING_PAYMENT)
    Saga->>Saga: ProcessPaymentStep.execute()
    Saga->>DB: INSERT saga_outbox

    Note over Saga: === Bước 4: CREATE_ORDER ===
    Saga->>DB: UPDATE saga (CREATING_ORDER)
    Saga->>Saga: CreateOrderStep.execute()
    Saga->>DB: INSERT saga_outbox

    Note over Saga: === Bước 5: SEND_NOTIFICATION ===
    Saga->>DB: UPDATE saga (SENDING_NOTIFICATION)
    Saga->>Saga: SendNotificationStep.execute()
    Saga->>DB: INSERT saga_outbox

    Saga->>DB: UPDATE saga (COMPLETED)
```

---

## 2. Saga Steps & State Machine

```mermaid
stateDiagram-v2
    [*] --> STARTED
    STARTED --> VALIDATING_PRODUCT
    VALIDATING_PRODUCT --> RESERVING_INVENTORY
    RESERVING_INVENTORY --> PROCESSING_PAYMENT
    PROCESSING_PAYMENT --> CREATING_ORDER
    CREATING_ORDER --> SENDING_NOTIFICATION
    SENDING_NOTIFICATION --> COMPLETED
    COMPLETED --> [*]

    VALIDATING_PRODUCT --> COMPENSATING : Fail
    RESERVING_INVENTORY --> COMPENSATING : Fail
    PROCESSING_PAYMENT --> COMPENSATING : Fail
    CREATING_ORDER --> COMPENSATING : Fail
    COMPENSATING --> COMPENSATED
    COMPENSATED --> [*]
    COMPENSATING --> FAILED
```

### Saga Steps

| Step | Executor | Hành động | Compensation |
|------|----------|-----------|--------------|
| VALIDATE_PRODUCT | `ValidateProductStep` | Check productId tồn tại | — |
| RESERVE_INVENTORY | `ReserveInventoryStep` | Giữ hàng (simulated) | Release inventory |
| PROCESS_PAYMENT | `ProcessPaymentStep` | Validate amount > 0 | Refund payment |
| CREATE_ORDER | `CreateOrderStep` | Tạo order (simulated) | Cancel order |
| SEND_NOTIFICATION | `SendNotificationStep` | Gửi thông báo (simulated) | — |

---

## 3. Compensation Flow

```mermaid
sequenceDiagram
    participant Saga as saga-orchestrator
    participant DB as saga_db

    Note over Saga: Step PROCESS_PAYMENT fails
    Saga->>DB: UPDATE saga (COMPENSATING)

    Note over Saga: Compensation step 1
    Saga->>Saga: ReserveInventoryStep.compensate()
    Note over Saga: Release held inventory

    Note over Saga: Compensation step 2
    Saga->>Saga: ValidateProductStep.compensate()
    Note over Saga: No-op (validation không có side effect)

    Saga->>DB: UPDATE saga (COMPENSATED)
    alt Compensation fail
        Saga->>DB: UPDATE saga (FAILED)
    end
```

### Compensation Logic

```
execute steps: [A, B, C, D, E]
fail at: C

compensate: [D(comp), C(comp)] → chỉ compensate những step đã execute
thực tế: [B(comp), A(comp)] → reverse order, skip step C vì chưa execute
```

---

## 4. Outbox Pattern

```mermaid
sequenceDiagram
    participant Saga as saga-orchestrator
    participant DB as saga_db
    participant Poller as SagaEventProducer (Scheduled)
    participant Kafka

    Note over Saga: Mỗi step execute xong
    Saga->>DB: INSERT saga_outbox (eventType, payload, status=PENDING)

    Note over Poller: @Scheduled(fixedDelay=5000)
    loop Mỗi 5 giây
        Poller->>DB: findByStatus(PENDING)
        DB-->>Poller: List<SagaOutbox>

        loop Mỗi outbox item
            Poller->>Poller: Map eventType -> Kafka topic
            Poller->>Kafka: Publish event
            Poller->>DB: UPDATE status = SENT
        end
    end
```

### Outbox Table

| Column | Type | Mô tả |
|--------|------|-------|
| id | UUID (PK) | |
| saga_instance_id | UUID (FK) | |
| event_type | VARCHAR | STEP_COMPLETED, STEP_FAILED |
| payload | TEXT (JSON) | Event data |
| status | VARCHAR | PENDING / SENT |
| created_at | TIMESTAMP | |

### Kafka Topics từ Outbox

| Event Type | Kafka Topic |
|------------|-------------|
| STEP_COMPLETED:VALIDATE_PRODUCT | (internal) |
| STEP_COMPLETED:RESERVE_INVENTORY | `inventory.reserve` |
| STEP_COMPLETED:PROCESS_PAYMENT | `payment.required` |
| STEP_COMPLETED:CREATE_ORDER | `order.confirmed` |
| STEP_COMPLETED:SEND_NOTIFICATION | `notification.send` |

---

## 5. Saga Instance Model

```json
{
  "id": "uuid",
  "sagaType": "ORDER_SAGA",
  "status": "STARTED",
  "currentStep": "VALIDATING_PRODUCT",
  "totalSteps": 5,
  "payload": {
    "orderId": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "productId": 1,
    "amount": 25000000
  },
  "startedAt": "2026-07-03T08:00:00",
  "completedAt": null,
  "failedAt": null,
  "failureReason": null
}
```

---

## 6. REST API

```mermaid
sequenceDiagram
    actor Admin
    participant Gateway
    participant SagaSvc as saga-orchestrator
    participant DB

    Note over Admin: POST /api/v1/sagas/orders
    Admin->>Gateway: { payload }
    SagaSvc->>SagaSvc: OrderSagaOrchestrator.startSaga()
    SagaSvc->>DB: INSERT saga_instances
    SagaSvc->>SagaSvc: processNextStep() (immediate)
    SagaSvc-->>Admin: SagaInstance response + sagaId

    Note over Admin: GET /api/v1/sagas/{id}
    Admin->>Gateway: Check saga status
    SagaSvc->>DB: findById(id)
    SagaSvc-->>Admin: SagaInstance (currentStatus, step)
```

---

## 7. Event Flow

```mermaid
flowchart LR
    subgraph Sources
        OC[order.changed]
        PC[payment.changed]
    end

    subgraph Kafka
        OC
        PC
        SE[saga.events]
    end

    subgraph saga-orchestrator
        SEC[SagaEventConsumer]
        SO[SagaOrchestrator]
        SEP[SagaEventProducer]
        OB[(saga_outbox)]
    end

    OC --> SEC --> SO
    PC --> SEC --> SO
    SO --> OB
    SEP -->|poll| OB
    SEP -->|publish| SE
    SE --> SEC
```

---

## 8. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Step execute fail | Gọi compensate() cho các step đã chạy |
| Compensation fail | Saga status = FAILED (manual intervention) |
| Outbox publish fail | Retry ở lần poll tiếp theo |
| Saga timeout | Cần implement timeout mechanism (chưa có) |
| Duplicate event | Idempotent handling qua sagaInstanceId |
