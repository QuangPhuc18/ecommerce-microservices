# Task T11: Xây dựng Payment Service (Thanh toán & Ví)

## 1. Mục tiêu
- Xử lý nạp tiền, rút tiền, thanh toán đơn hàng, và audit trail.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/payment-service/`.
- [ ] Entity `Transaction` (user_id, type ENUM, amount, order_id).
- [ ] Entity `AuditTrail` (ghi log thay đổi số dư).
- [ ] Tích hợp VNPay (hoặc Momo) qua API.
- [ ] API `POST /api/v1/payments/deposit` (nạp tiền).
- [ ] API `POST /api/v1/payments/withdraw` (rút tiền).
- [ ] API `POST /api/v1/payments/hold` (giữ tiền khi đặt hàng).
- [ ] API `POST /api/v1/payments/release` (giải ngân cho seller).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Nạp tiền thành công, số dư tăng.
- [ ] Audit trail ghi lại đúng thông tin.

## 4. Ghi chú kỹ thuật
- Sử dụng gRPC để giao tiếp với Order Service (hiệu suất cao).
- Cần dùng Redis Distributed Lock để tránh trùng lặp giao dịch.