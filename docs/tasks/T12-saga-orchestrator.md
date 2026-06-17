# Task T12: Xây dựng Saga Orchestrator (Distributed Transaction)

## 1. Mục tiêu
- Đảm bảo tính nhất quán cho luồng "Tạo đơn -> Giữ tiền -> Xác nhận".

## 2. Phạm vi công việc
- [ ] Tạo module `backend/saga-orchestrator/`.
- [ ] Định nghĩa các Step: `ValidateProductStep`, `HoldPaymentStep`, `CreateOrderStep`, `SendNotificationStep`.
- [ ] Xây dựng State Machine: `STARTED -> PENDING_PAYMENT -> ORDER_CREATED -> COMPLETED`.
- [ ] Xử lý Compensation (Rollback): nếu thanh toán thất bại, gửi event hoàn tiền.
- [ ] Consumer Kafka nhận `OrderCreatedEvent` -> trigger Saga.
- [ ] Producer Kafka gửi `PaymentRequiredEvent`, `OrderConfirmedEvent`, v.v.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Flow thành công tạo Order và Payment.
- [ ] Flow thất bại (VD: hết hàng) -> tự động rollback, không có dữ liệu rác.

## 4. Ghi chú kỹ thuật
- Lưu trạng thái Saga vào DB (Postgres) để phục hồi nếu orchestrator crash.
- Sử dụng Outbox Pattern để đảm bảo event được gửi đi chính xác 1 lần.