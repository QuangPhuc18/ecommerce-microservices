# Task T10: Xây dựng Order Service (Đơn hàng & Vận chuyển)

## 1. Mục tiêu
- Quản lý vòng đời đơn hàng, trạng thái, thông tin giao hàng.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/order-service/`.
- [ ] Entity `Order` (product_id, buyer_id, seller_id, total_price, status ENUM).
- [ ] Entity `OrderHistory` (tracking trạng thái).
- [ ] Entity `ShippingInfo` (receiver_name, phone, address).
- [ ] API `POST /api/v1/orders` (tạo đơn -> gọi Saga Orchestrator).
- [ ] API `GET /api/v1/orders/buyer` (lịch sử mua).
- [ ] API `GET /api/v1/orders/seller` (lịch sử bán).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Tạo đơn hàng thành công, lưu đúng `created_at`.
- [ ] Khi status thay đổi (PAID -> SHIPPING -> COMPLETED), có record trong `order_history`.

## 4. Ghi chú kỹ thuật
- Không tự xử lý thanh toán ở đây, chỉ emit `OrderCreatedEvent` để Saga bắt đầu.