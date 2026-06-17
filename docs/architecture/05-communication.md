# Cơ chế giao tiếp giữa các service

## 1. Đồng bộ (Synchronous)
- **OpenFeign** (REST): Dùng cho hầu hết các cuộc gọi giữa các service. Ví dụ: User Service gọi Product Service để lấy thông tin người bán.
- **gRPC**: Dùng cho các service yêu cầu hiệu suất cao và độ trễ thấp, đặc biệt là giữa **Order Service** và **Payment Service** (vì cần phản hồi nhanh khi thanh toán).

## 2. Bất đồng bộ (Asynchronous)
Sử dụng hai loại message broker:

### Apache Kafka
- Dùng cho các **sự kiện hệ thống lớn**, cần lưu trữ và phát lại.
- Các topic chính:
  - `user.created` → Auth Service gửi, User Service và Notification Service tiêu thụ.
  - `product.created` / `product.updated` → Product Service gửi, Search Service và Analytics Service tiêu thụ.
  - `order.created` → Order Service gửi, Saga Orchestrator khởi tạo quy trình.
  - `payment.completed` → Payment Service gửi, Order Service và Notification Service tiêu thụ.
  - `saga.compensated` → Saga Orchestrator gửi để thông báo rollback.

### RabbitMQ
- Dùng cho các **tác vụ ngắn, yêu cầu xác nhận (ACK)**.
- Ví dụ: Gửi email OTP, gửi SMS, tạo thumbnail ảnh, v.v.

## 3. Saga Pattern
- **Saga Orchestrator** điều phối luồng giao dịch phân tán (ví dụ: tạo đơn hàng).
- Luồng:
  1. Order Service nhận request tạo đơn → emit `OrderCreatedEvent`.
  2. Saga Orchestrator nhận event → lần lượt gọi các bước:
     - Xác thực sản phẩm (Product Service)
     - Giữ tiền (Payment Service)
     - Tạo đơn hàng (Order Service)
     - Gửi thông báo (Notification Service)
  3. Nếu bất kỳ bước nào thất bại, thực hiện compensation (rollback) cho các bước đã thành công.
- Sử dụng Kafka để đảm bảo các sự kiện được xử lý tuần tự và có thể phục hồi.