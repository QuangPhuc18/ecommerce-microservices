# 07 — Notification Flow

## Tổng quan

Gửi thông báo đa kênh (Email/SMS/Push) khi có sự kiện trong hệ thống.

**Services tham gia:**
- `notification-service` (port 8008) — xử lý và gửi thông báo
- `order-service` (port 8005) — source event
- `payment-service` (port 8006) — source event
- `auth-service` (port 8001) — source event

**Database:** `notification_db` PostgreSQL — `notifications`
**Kafka topics:** `order.changed`, `payment.changed`, `notification.send`

---

## 1. Luồng gửi thông báo tổng quan

```mermaid
flowchart LR
    subgraph Sources
        O[order.changed]
        P[payment.changed]
    end

    subgraph notification-service
        NC[NotificationConsumer]
        NS[NotificationService]
        ES[EmailService]
        SS[SmsService]
        PS[PushNotificationService]
    end

    subgraph Channels
        EM[Email<br/>Spring Mail + Thymeleaf]
        SM[SMS<br/>Twilio - simulated]
        PN[Push<br/>Firebase - simulated]
    end

    subgraph Storage
        DB[(notification_db<br/>notifications)]
    end

    O --> NC
    P --> NC
    NC --> NS
    NS --> ES --> EM
    NS --> SS --> SM
    NS --> PS --> PN
    NS --> DB
```

---

## 2. Gửi email xác nhận đơn hàng

```mermaid
sequenceDiagram
    participant OrderSvc as order-service
    participant Kafka
    participant NotifSvc as notification-service
    participant DB as notification_db
    participant MailServer as SMTP Server

    OrderSvc->>Kafka: Publish order.changed (ORDER_CREATED)

    Kafka->>NotifSvc: Consumer receives event
    NotifSvc->>NotifSvc: NotificationService.sendOrderConfirmation()

    NotifSvc->>NotifSvc: Build Thymeleaf template
    Note over NotifSvc: email/order-confirmation.html

    NotifSvc->>MailServer: Send MIME message
    Note over MailServer: HTML email với order details

    NotifSvc->>DB: INSERT notification (channel=EMAIL, type=ORDER_CONFIRMATION)
    DB-->>NotifSvc: Saved

    NotifSvc-->>Kafka: Ack message
```

### Email Templates (Thymeleaf)

| Template | Trigger | Variables |
|----------|---------|-----------|
| `email/order-confirmation.html` | Order created | orderNumber, items, total, address |
| `email/payment-received.html` | Payment completed | amount, method, transactionId |
| `email/welcome.html` | User registered | fullName |

---

## 3. REST API — Truy vấn thông báo

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant NotifSvc as notification-service
    participant DB

    User->>Gateway: GET /api/v1/notifications?page=0&size=20
    NotifSvc->>DB: findByUserIdOrderByCreatedAtDesc(userId, pageable)
    DB-->>NotifSvc: Page<Notification>
    NotifSvc-->>User: Paginated notifications

    User->>Gateway: GET /api/v1/notifications/unread-count
    NotifSvc->>DB: countByUserIdAndIsReadFalse(userId)
    DB-->>NotifSvc: 5
    NotifSvc-->>User: { unreadCount: 5 }

    User->>Gateway: PUT /api/v1/notifications/{id}/read
    NotifSvc->>DB: UPDATE SET isRead = true
    NotifSvc-->>User: { success: true }
```

### Notification Model

| Column | Type | Mô tả |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID | Người nhận |
| type | VARCHAR | ORDER_CONFIRMATION, PAYMENT_RECEIVED, WELCOME |
| title | VARCHAR | Tiêu đề |
| body | TEXT | Nội dung |
| channel | VARCHAR | EMAIL / SMS / PUSH |
| reference_type | VARCHAR | order, payment |
| reference_id | VARCHAR | ID của đối tượng liên quan |
| is_read | BOOLEAN | Đã đọc? |
| sent_at | TIMESTAMP | |
| read_at | TIMESTAMP | |

---

## 4. Channels Implementation

| Channel | Library | Status |
|---------|---------|--------|
| Email | Spring Mail + Thymeleaf | **Working** — HTML template, MIME |
| SMS | Twilio | **Simulated** — chỉ log |
| Push | Firebase | **Simulated** — chỉ log |

### NotificationService Methods

```mermaid
flowchart TD
    sendOrderConfirmation --> email
    sendPaymentReceived --> email
    sendWelcome --> email
    sendSmsNotification --> log
    sendPushNotification --> log
```

---

## 5. Event Flow

```mermaid
flowchart LR
    subgraph Kafka Topics
        OC[order.changed]
        PC[payment.changed]
    end

    subgraph Consumer
        NC[NotificationConsumer]
    end

    subgraph Dispatch
        OC -->|ORDER_CREATED| NC
        OC -->|STATUS_CHANGED| NC
        PC -->|PAYMENT_COMPLETED| NC
        PC -->|PAYMENT_REFUNDED| NC
    end

    NC --> ns[NotificationService]
    ns -->|ORDER_CREATED| sendOrderConfirmation
    ns -->|PAYMENT_COMPLETED| sendPaymentReceived
    ns -->|Other events| logOnly
```

---

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Mail server down | Log error, notification vẫn lưu DB (status = FAILED) |
| Email invalid | Log và skip |
| Kafka consumer lag | Auto-commit offset, at-least-once delivery |
| Thymeleaf render fail | Fallback text template |
