# Task T14: Xây dựng Notification Service

## 1. Mục tiêu
- Gửi thông báo đến user qua Email, SMS, Push Notification.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/notification-service/`.
- [ ] Tích hợp SMTP (Gmail/SendGrid) cho Email.
- [ ] Tích hợp Twilio (hoặc Viettel API) cho SMS OTP.
- [ ] Tích hợp Firebase Cloud Messaging (FCM) cho Push Mobile.
- [ ] Consumer Kafka lắng nghe các event: `OrderConfirmedEvent`, `PaymentReceivedEvent`, `ProductSoldEvent`.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] User nhận được email xác nhận khi đăng ký.
- [ ] User nhận được thông báo "Đơn hàng đã được xác nhận".

## 4. Ghi chú kỹ thuật
- Dùng Template Engine (Thymeleaf) để tạo nội dung email đẹp mắt.