# Task T22: Xây dựng Luồng Đặt hàng & Checkout

## 1. Mục tiêu
- Cho phép user mua sản phẩm và theo dõi đơn hàng.

## 2. Phạm vi công việc
- [ ] Page `/product/[slug]` có nút "Mua ngay" -> dẫn đến trang Checkout.
- [ ] Page `/checkout`: Hiển thị thông tin sản phẩm, chọn địa chỉ nhận hàng, chọn phương thức thanh toán (Ví hoặc VNPay).
- [ ] Gọi API `POST /orders` để tạo đơn.
- [ ] Page `/orders` (lịch sử mua hàng) -> hiển thị danh sách đơn hàng.
- [ ] Page `/orders/[id]` -> chi tiết trạng thái đơn hàng.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Đặt hàng thành công, chuyển sang trang thanh toán VNPay (sandbox).
- [ ] Lịch sử đơn hàng hiển thị đúng trạng thái (PENDING, PAID, SHIPPING, DELIVERED).

## 4. Ghi chú kỹ thuật
- Trạng thái đơn hàng được cập nhật realtime nhờ WebSocket (hoặc polling 5s).