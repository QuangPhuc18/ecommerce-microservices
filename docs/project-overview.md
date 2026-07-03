# Tổng quan Dự án E-commerce Microservices

Dựa trên các tài liệu thiết kế (Architecture Docs) trong thư mục `docs/architecture` và tiến độ trong dự án, dưới đây là chi tiết các câu hỏi của bạn:

## 1. Sơ lượt tổng quan về dự án
- **Đối tượng:** Dự án là một nền tảng thương mại điện tử mô hình **C2C** (Customer-to-Customer), tương tự như Chợ Tốt. Người dùng có thể đóng vai trò vừa là người mua, vừa là người bán.
- **Chức năng chính:** Hệ thống bao gồm 11 microservice đảm nhận các nghiệp vụ riêng biệt: Xác thực (Auth), Quản lý người dùng (User), Quản lý sản phẩm (Product), Tìm kiếm (Search), Đơn hàng (Order), Thanh toán và Ví (Payment), Chat realtime (Chat), Thông báo (Notification), Quản trị và Thống kê (Analytics & Admin).
- **Các bảng và mối liên hệ (Cơ sở dữ liệu):**
  Mỗi service sử dụng một Database PostgreSQL độc lập nhằm đảm bảo tính toàn vẹn của Microservices (Database per service). Các bảng chính:
  - **Auth DB**: `users`, `refresh_tokens`.
  - **User DB**: `users` (thông tin cơ bản), `client_profiles`, `user_addresses`, `user_ratings`.
  - **Product DB**: `categories`, `products` (dùng JSONB lưu thuộc tính động), `product_images`, `product_favorites`, `boost_packages`.
  - **Order DB**: `orders`, `order_history`, `shipping_info`.
  - **Payment DB**: `transactions`, `audit_trail`.
  - **Chat DB**: `conversations`, `messages`, `conversation_participants`.
  - **Analytics DB (TimescaleDB)**: `system_reports`, `admin_logs`.
  *Mối liên hệ:* Các bảng liên kết với nhau bằng UUID. Giữa các microservice, sự liên kết dữ liệu được đồng bộ thông qua các sự kiện (events) bằng Kafka thay vì join trực tiếp (foreign key) như database nguyên khối.

## 2. Quy trình hoặc mô hình dự án
- **Mô hình kiến trúc:** Microservices Architecture kết hợp Event-Driven Architecture (kiến trúc hướng sự kiện).
- **Luồng (Flow) tổng thể:**
  `Client Layer (Web/Mobile)` ➜ `API Gateway (Spring Cloud Gateway)` ➜ `Service Discovery (Eureka)` ➜ `Microservices Layer`.
- **Cấu trúc Source Code:** Quản lý theo cấu trúc **Monorepo** với một thư mục gốc chứa cả `backend/`, `frontend/`, và `infrastructure/`.

## 3. Tiến độ thực tế hiện tại
Dựa vào mã nguồn và danh sách các task (`docs/tasks`):
- **Kiến trúc & Thiết kế:** Đã hoàn thiện toàn bộ bản vẽ thiết kế (Database, Kiến trúc, Giao tiếp, Tech Stack) và danh sách 30 Tasks chi tiết (từ T01 đến T30).
- **Backend:** Đã khởi tạo cấu trúc Monorepo và khung (skeleton) cho các microservices backend. Các thư mục module (như `auth-service`, `product-service`, v.v.) đã được tạo ra cùng tệp `pom.xml` của Maven và có thể compile thành công.
- **Frontend & Hạ tầng:** Phần thư mục frontend và các code triển khai giao diện, hạ tầng trên cloud (Terraform/K8s) hiện tại chưa được bắt đầu xây dựng (mới nằm ở mức tài liệu). 
*=> Kết luận: Dự án đang ở giai đoạn đầu của việc code (setup base source code cho backend sau khi đã chốt xong toàn bộ architecture document).*

## 4. Từng công nghệ giải quyết vấn đề gì, vì sao lại chọn nó
- **Spring Boot 3.2+ & Java 21:** Làm bộ khung chính cho Backend. Lý do: Ổn định, hệ sinh thái Microservice (Spring Cloud) mạnh mẽ, Java 21 có Virtual Threads giúp xử lý đồng thời vượt trội với tài nguyên thấp.
- **PostgreSQL:** Cơ sở dữ liệu chính. Lý do: RDBMS mạnh mẽ, đặc biệt kiểu dữ liệu `JSONB` xử lý rất tốt các thuộc tính mở rộng (attributes động) của sản phẩm C2C.
- **Elasticsearch:** Dùng cho Search Service. Lý do: Phục vụ tìm kiếm Full-text search, autocomplete nhanh chóng mà Database thường không tối ưu được.
- **Redis (Cluster):** Dùng làm bộ nhớ đệm (Cache). Lý do: Xử lý rate limiting tại Gateway, cache session, distributed lock.
- **Apache Kafka:** Message Broker chính. Lý do: Lưu trữ và truyền tải Event để phục vụ Event-driven và Saga Pattern (giao dịch phân tán). Có khả năng replay lại message nếu service bị chết.
- **RabbitMQ:** Task Queue. Lý do: Phù hợp cho các task ngắn, bất đồng bộ nhưng cần xác nhận (ACK) nhanh (gửi email, SMS).
- **Next.js 14+ (TypeScript):** Dùng làm Frontend. Lý do: Hỗ trợ Server-Side Rendering (SSR) giúp SEO cực kỳ tốt – đây là yếu tố sống còn của một trang E-commerce.
- **Docker & Kubernetes:** Đóng gói và điều phối container. Lý do: Giúp scale tự động độc lập từng service (VD: Mùa sale scale Order service mà không cần scale Chat service).

## 5. Phân luồng hoạt động (workflow) của từng chức năng trong dự án
Hệ thống sử dụng linh hoạt giữa giao tiếp đồng bộ và bất đồng bộ:
- **Đồng bộ (Synchronous):** Sử dụng `OpenFeign` (REST) cho các tác vụ lấy dữ liệu nhanh chóng giữa các service, và `gRPC` cho các thao tác yêu cầu độ trễ cực thấp (giữa Order và Payment).
- **Bất đồng bộ (Asynchronous) - Phân luồng luồng Đặt hàng (Saga Pattern):**
  Luồng này giải quyết bài toán giao dịch phân tán (Distributed Transaction) tránh sai sót dữ liệu khi tạo đơn hàng:
  1. Người mua tạo yêu cầu Đặt hàng tại **Order Service** ➜ Phát sự kiện `OrderCreatedEvent` vào Kafka.
  2. **Saga Orchestrator** (Người điều phối) nhận sự kiện và ra lệnh lần lượt cho các service khác:
     - Gọi **Product Service** để kiểm tra và giữ tồn kho/trạng thái sản phẩm.
     - Gọi **Payment Service** để kiểm tra số dư và trừ tiền (hoặc giữ tiền - Hold).
     - Gọi lại **Order Service** để cập nhật trạng thái Đơn hàng thành công.
     - Cuối cùng, gọi **Notification Service** để gửi email/app push báo cho các bên.
  3. **Rollback (Compensation):** Nếu ở bất kỳ bước nào thất bại (VD: Không đủ tiền thanh toán), Saga Orchestrator sẽ phát sự kiện yêu cầu các service trước đó nhả tồn kho và khôi phục trạng thái ban đầu để đảm bảo tính nhất quán (không bao giờ có chuyện mất tiền mà không có đơn).
