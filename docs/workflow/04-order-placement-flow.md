# 04 — Order Placement Flow

## Tổng quan

Xử lý toàn bộ vòng đời đơn hàng: tạo đơn, chuyển trạng thái, và distributed transaction qua Saga.

**Services tham gia:**
- `api-gateway` (port 8080) — routing, JWT
- `order-service` (port 8005) — business logic, state machine
- `saga-orchestrator` (port 8010) — distributed transaction
- `payment-service` (port 8006) — xử lý thanh toán
- `notification-service` (port 8008) — gửi thông báo
- `product-service` (port 8003) — validate sản phẩm

**Database:** `order_db` PostgreSQL — `orders`, `order_items`, `order_histories`
**Kafka topics:** `order.changed`, `payment.changed`, `saga.events`

---

## 1. Tạo đơn hàng

```mermaid
sequenceDiagram
    actor Buyer
    participant Gateway as API Gateway (8080)
    participant OrderSvc as order-service (8005)
    participant DB as order_db
    participant Kafka
    participant Saga as saga-orchestrator

    Buyer->>Gateway: POST /api/v1/orders
    Note over Buyer: { productId, quantity, shippingAddress }

    Gateway->>Gateway: Validate JWT, inject X-User-Id
    Gateway->>OrderSvc: Forward + header

    OrderSvc->>OrderSvc: OrderService.createOrder()
    OrderSvc->>OrderSvc: Generate order number (ORD-YYYYMMDD-XXXXXX)
    OrderSvc->>OrderSvc: Build Order entity + OrderItem
    OrderSvc->>OrderSvc: Set status = PENDING

    OrderSvc->>DB: INSERT INTO orders
    OrderSvc->>DB: INSERT INTO order_items
    OrderSvc->>DB: INSERT INTO order_histories (PENDING)
    DB-->>OrderSvc: Order saved

    OrderSvc->>Kafka: Publish order.changed (ORDER_CREATED)
    OrderSvc-->>Gateway: 201 OrderResponse
    Gateway-->>Buyer: Order created

    par Saga Orchestration
        Kafka->>Saga: order.changed event
        Saga->>Saga: startSaga(ORDER_SAGA, payload)
    end
```

### Order Number Format

`ORD-YYYYMMDD-XXXXXX`
- VD: `ORD-20260703-000001`
- Tự động tăng theo ngày (reset hàng ngày)

### Request / Response

**Request:**
```json
POST /api/v1/orders
{
  "productId": 1,
  "quantity": 1,
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0909123456",
    "address": "123 Nguyen Hue",
    "ward": "Ben Nghe",
    "district": "District 1",
    "province": "Ho Chi Minh"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20260703-000001",
  "status": "PENDING",
  "totalAmount": 25000000,
  "items": [{ "productId": 1, "quantity": 1, "subtotal": 25000000 }]
}
```

---

## 2. State Machine — Order Status

```mermaid
stateDiagram-v2
    [*] --> PENDING : Tạo đơn
    PENDING --> CONFIRMED : Xác nhận
    PENDING --> CANCELLED : Hủy
    CONFIRMED --> PROCESSING : Đang xử lý
    CONFIRMED --> CANCELLED : Hủy
    PROCESSING --> SHIPPED : Đã giao cho vận chuyển
    PROCESSING --> CANCELLED : Hủy
    SHIPPED --> DELIVERED : Đã nhận hàng
    DELIVERED --> REFUNDED : Hoàn tiền
    CANCELLED --> [*]
    REFUNDED --> [*]
```

### Ma trận chuyển trạng thái

| Từ → Đến | Điều kiện | Ai thực hiện |
|-----------|-----------|-------------|
| PENDING → CONFIRMED | Thanh toán thành công | Hệ thống |
| PENDING → CANCELLED | Buyer hủy | Buyer |
| CONFIRMED → PROCESSING | Seller xác nhận | Seller |
| CONFIRMED → CANCELLED | Seller từ chối | Seller |
| PROCESSING → SHIPPED | Đã giao vận chuyển | Seller |
| PROCESSING → CANCELLED | Seller hủy | Seller |
| SHIPPED → DELIVERED | Buyer xác nhận | Buyer |
| DELIVERED → REFUNDED | Yêu cầu hoàn tiền | Hệ thống |

---

## 3. Cập nhật trạng thái

```mermaid
sequenceDiagram
    actor Seller
    participant Gateway
    participant OrderSvc as order-service
    participant DB

    Seller->>Gateway: PUT /api/v1/orders/{id}/status
    Note over Seller: { status: "PROCESSING", note: "Đang kiểm tra hàng" }

    Gateway->>OrderSvc: Forward + X-User-Id
    OrderSvc->>DB: findById(id)
    DB-->>OrderSvc: Order

    OrderSvc->>OrderSvc: stateMachine.canTransition(current, target)

    alt Valid transition
        OrderSvc->>DB: UPDATE orders SET status = target
        OrderSvc->>DB: INSERT order_histories
        OrderSvc->>Kafka: Publish order.changed (STATUS_CHANGED)
        OrderSvc-->>Seller: 200 OrderResponse
    else Invalid transition
        OrderSvc-->>Seller: 400 BusinessException
        Note over Seller: "Cannot transition from CONFIRMED to REFUNDED"
    end
```

---

## 4. Danh sách đơn hàng

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant OrderSvc as order-service
    participant DB

    User->>Gateway: GET /api/v1/orders?page=0&size=10
    Gateway->>OrderSvc: Forward + X-User-Id

    alt User là buyer
        OrderSvc->>DB: findByBuyerId(userId, pageable)
    else User là seller
        Note over User: GET /api/v1/seller/orders
        OrderSvc->>DB: findBySellerId(userId, pageable)
    end

    DB-->>OrderSvc: Page<Order>
    OrderSvc-->>User: OrderListResponse (paginated)
```

---

## 5. Event Flow

```mermaid
flowchart LR
    subgraph order-service
        O[OrderService] -->|publish| E(order.changed)
    end
    subgraph Kafka
        E
    end
    subgraph payment-service
        E --> P[OrderEventConsumer]
        P -->|auto-process COD| PP[PaymentService.process]
    end
    subgraph notification-service
        E --> N[NotificationConsumer]
        N -->|order confirmation email| NE[EmailService]
    end
    subgraph analytics-service
        E --> A[AnalyticsConsumer]
        A -->|increment orders + revenue| DM[DashboardMetrics]
    end
    subgraph saga-orchestrator
        E --> S[SagaEventConsumer]
        S -->|start saga| SO[SagaOrchestrator]
    end
```

**Payload `order.changed`:**
```json
{
  "eventType": "ORDER_CREATED",
  "orderId": "uuid",
  "orderNumber": "ORD-20260703-000001",
  "buyerId": "uuid",
  "sellerId": "uuid",
  "totalAmount": 25000000,
  "status": "PENDING"
}
```

---

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Sản phẩm không tồn tại | Saga compensate — refund nếu đã thanh toán |
| Thanh toán thất bại | Order remain PENDING, không chuyển CONFIRMED |
| Hủy khi đã SHIPPED | Không cho phép (state machine reject) |
| DB constraint fail | Rollback transaction, return 500 |
