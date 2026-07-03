# 05 — Payment Processing Flow

## Tổng quan

Xử lý thanh toán, quản lý ví điện tử, tích hợp VNPay, hoàn tiền.

**Services tham gia:**
- `api-gateway` (port 8080) — routing, JWT
- `payment-service` (port 8006) — business logic
- `order-service` (port 8005) — cập nhật trạng thái đơn hàng
- `notification-service` (port 8008) — thông báo

**Database:** `payment_db` PostgreSQL — `payments`, `wallets`, `transactions`, `payment_logs`, `audit_trails`
**Kafka topics:** `payment.changed`, `order.changed`

---

## 1. Thanh toán đơn hàng

```mermaid
sequenceDiagram
    actor Buyer
    participant Gateway as API Gateway (8080)
    participant PaymentSvc as payment-service (8006)
    participant DB as payment_db
    participant Kafka

    Buyer->>Gateway: POST /api/v1/payments
    Note over Buyer: { orderId, amount, method: "E_WALLET" }

    Gateway->>Gateway: Validate JWT
    Gateway->>PaymentSvc: Forward + X-User-Id

    PaymentSvc->>PaymentSvc: PaymentValidator.validate()
    PaymentSvc->>DB: Tạo Payment (status = PENDING)
    PaymentSvc->>DB: Tạo PaymentLog (PENDING)

    alt Phương thức E_WALLET
        PaymentSvc->>DB: WalletRepository.findByUserId()
        DB-->>PaymentSvc: Wallet entity
        PaymentSvc->>PaymentSvc: Check balance >= amount
        alt Đủ tiền
            PaymentSvc->>DB: wallet.setBalance(balance - amount) [Optimistic Lock]
            PaymentSvc->>DB: INSERT transactions (PAYMENT, balanceBefore, balanceAfter)
            PaymentSvc->>DB: INSERT audit_trails
            PaymentSvc->>DB: UPDATE payment (status = COMPLETED)
            PaymentSvc->>DB: INSERT PaymentLog (COMPLETED)
        else Không đủ tiền
            PaymentSvc->>DB: UPDATE payment (status = FAILED)
            PaymentSvc-->>Buyer: 400 INSUFFICIENT_BALANCE
        end
    else Phương thức VNPay
        PaymentSvc->>PaymentSvc: VNPayService.createPaymentUrl()
        Note over PaymentSvc: HMAC-SHA512 sign params
        PaymentSvc-->>Buyer: 201 { paymentUrl: "https://sandbox.vnpay..." }
        Buyer->>PaymentSvc: GET callback (VNPay return)
        PaymentSvc->>PaymentSvc: VNPayService.verifyReturn()
    end

    PaymentSvc->>Kafka: Publish payment.changed
    PaymentSvc-->>Buyer: PaymentResponse
```

### Payment Status

```mermaid
stateDiagram-v2
    [*] --> PENDING : Khởi tạo
    PENDING --> PROCESSING : Đang xử lý
    PROCESSING --> COMPLETED : Thành công
    PROCESSING --> FAILED : Thất bại
    COMPLETED --> REFUNDED : Hoàn tiền
    PENDING --> CANCELLED : Hủy
    FAILED --> [*]
    REFUNDED --> [*]
    CANCELLED --> [*]
```

---

## 2. Ví điện tử (Wallet)

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant PaymentSvc as payment-service
    participant DB

    Note over User: POST /api/v1/payments/wallet
    User->>Gateway: Create wallet
    PaymentSvc->>DB: existsByUserId
    DB-->>PaymentSvc: Chưa có
    PaymentSvc->>DB: INSERT wallets (userId, balance=0, currency=VND)
    PaymentSvc-->>User: WalletResponse

    Note over User: POST /api/v1/payments/deposit
    User->>Gateway: { amount: 1000000 }
    PaymentSvc->>PaymentSvc: Check deposit limit (max 50,000,000)
    PaymentSvc->>DB: wallet.balance += amount (Optimistic Lock)
    PaymentSvc->>DB: INSERT transactions (DEPOSIT)
    PaymentSvc->>DB: INSERT audit_trails
    PaymentSvc-->>User: WalletResponse

    Note over User: POST /api/v1/payments/withdraw
    PaymentSvc->>PaymentSvc: Check balance >= amount
    PaymentSvc->>DB: wallet.balance -= amount
    PaymentSvc->>DB: INSERT transactions (WITHDRAW)
    PaymentSvc-->>User: WalletResponse
```

### Wallet Operations

| Endpoint | Mô tả | Validation |
|----------|-------|------------|
| `POST /wallet` | Tạo ví mới | User chưa có ví |
| `GET /wallet` | Xem số dư | — |
| `POST /deposit` | Nạp tiền | Max 50,000,000 VND/lần |
| `POST /withdraw` | Rút tiền | Balance >= amount |
| `POST /hold` | Giữ tiền (đặt cọc) | Balance >= amount |
| `POST /release` | Giải tỏa tiền | Hold reference exists |

### Optimistic Locking

```java
@Entity
public class Wallet {
    @Version
    private Long version; // Optimistic lock
    private BigDecimal balance;
}
```

Wallet sử dụng `@Version` để tránh race condition khi có nhiều giao dịch đồng thời.

---

## 3. VNPay Integration

```mermaid
sequenceDiagram
    participant Client as Browser
    participant PaymentSvc as payment-service
    participant VNPay as VNPay Sandbox

    Client->>PaymentSvc: POST /payments (method = BANK_TRANSFER)
    PaymentSvc->>PaymentSvc: Build VNPay params
    Note over PaymentSvc: vnp_TmnCode, vnp_Amount, vnp_TxnRef, vnp_ReturnUrl
    PaymentSvc->>PaymentSvc: HMAC-SHA512 sign (secureHash)
    PaymentSvc-->>Client: { paymentUrl }

    Client->>VNPay: Redirect to paymentUrl
    Note over VNPay: User nhập thẻ, OTP...
    VNPay->>Client: Redirect to returnUrl + params
    Client->>PaymentSvc: GET /vnpay-return?...
    PaymentSvc->>PaymentSvc: verifyReturn(params)
    alt Valid signature
        PaymentSvc->>PaymentSvc: Check vnp_ResponseCode == "00"
        PaymentSvc-->>Client: Success page
    else Invalid signature
        PaymentSvc-->>Client: Error page
    end
```

### VNPay Config

| Property | Value |
|----------|-------|
| `vnpay.tmnCode` | Mã website (VNPay cấp) |
| `vnpay.hashSecret` | Secret key (HMAC-SHA512) |
| `vnpay.paymentUrl` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `vnpay.returnUrl` | Callback URL |
| `vnpay.apiUrl` | `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction` |

---

## 4. Hoàn tiền (Refund)

```mermaid
sequenceDiagram
    actor Admin
    participant PaymentSvc as payment-service
    participant DB
    participant Kafka

    Admin->>PaymentSvc: PUT /payments/{id}/refund
    PaymentSvc->>DB: findById(id)
    alt Payment status == COMPLETED
        PaymentSvc->>DB: UPDATE payment (status = REFUNDED)
        PaymentSvc->>DB: wallet.balance += amount
        PaymentSvc->>DB: INSERT transactions (REFUND)
        PaymentSvc->>Kafka: Publish payment.changed (REFUNDED)
        PaymentSvc-->>Admin: 200 PaymentResponse
    else Payment not COMPLETED
        PaymentSvc-->>Admin: 400 CANNOT_REFUND
    end
```

---

## 5. Event Flow

```mermaid
flowchart LR
    subgraph payment-service
        P[PaymentService] -->|publish| E(payment.changed)
    end
    subgraph Kafka
        E
    end
    subgraph notification-service
        E --> N[NotificationConsumer]
        N -->|payment receipt| NE[EmailService]
    end
    subgraph saga-orchestrator
        E --> S[SagaEventConsumer]
        S -->|resume saga| SO[SagaOrchestrator]
    end
```

**Payload `payment.changed`:**
```json
{
  "eventType": "PAYMENT_COMPLETED",
  "paymentId": "uuid",
  "orderId": "uuid",
  "amount": 25000000,
  "method": "E_WALLET",
  "status": "COMPLETED",
  "transactionId": "TXN-001"
}
```

---

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Không đủ số dư ví | Trả về `INSUFFICIENT_BALANCE` (4600) |
| OptimisticLockException | Retry 3 lần, sau đó fail với `CONCURRENT_TRANSACTION` |
| VNPay signature invalid | Log fraud attempt, không xử lý |
| Refund khi payment chưa COMPLETED | `CANNOT_REFUND` |
| Tạo ví khi đã có | `WALLET_ALREADY_EXISTS` |
