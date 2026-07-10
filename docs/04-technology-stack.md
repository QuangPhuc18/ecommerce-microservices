# 04. Công nghệ sử dụng

Bảng dưới đây tổng hợp các thành phần công nghệ, thư viện, cơ sở dữ liệu và công cụ được sử dụng trong toàn bộ hệ thống chợ đồ cũ **ĐồCũ**.

| Tầng | Công nghệ | Sử dụng tại | Mục đích | Lý do lựa chọn |
| ----- | ---------- | ------- | ------- | ------------ |
| **Frontend** | React 18 | `frontend` | Thư viện xây dựng giao diện người dùng cho ứng dụng trang đơn (SPA). | Tối ưu hóa việc tái sử dụng component, cơ chế Virtual DOM giúp render nhanh và có hệ sinh thái thư viện hỗ trợ rất lớn. |
| **Frontend** | Vite | `frontend` | Công cụ đóng gói (Build tool) và máy chủ phát triển (Dev server). | Cung cấp tốc độ Hot Module Replacement (HMR) cực nhanh và tối ưu hóa thời gian build ứng dụng so với Webpack truyền thống. |
| **Frontend** | Tailwind CSS | `frontend` | Thư viện CSS tiện ích (Utility-first CSS). | Cho phép thiết kế giao diện nhanh chóng trực tiếp trong file JSX bằng các class tiện ích, giữ cho file style có dung lượng nhỏ. |
| **Frontend** | Axios | `frontend` | Thư viện máy khách HTTP (HTTP Client). | Cú pháp đơn giản để gửi yêu cầu HTTP, tự động chuyển đổi JSON và hỗ trợ bộ lọc Interceptor để đính kèm token JWT tự động. |
| **Frontend** | React Router | `frontend` | Định tuyến phía client. | Hỗ trợ cấu hình định tuyến khai báo, lồng ghép layout (Outlet) và bảo vệ các tuyến đường yêu cầu đăng nhập. |
| **Backend** | Java 21 | Tất cả các Microservice | Ngôn ngữ lập trình chính của hệ thống. | Cung cấp các tính năng hiện đại (Virtual Threads, Records), kiểu dữ liệu mạnh mẽ, hiệu năng cao và có tính ổn định doanh nghiệp. |
| **Backend** | Spring Boot 3.3.5 | Tất cả các Microservice | Khung phát triển ứng dụng Java (Framework). | Khởi tạo nhanh dự án, cơ chế Dependency Injection tự động, tự cấu hình (auto-configurations) và hỗ trợ hoàn hảo cho kiến trúc đám mây. |
| **Backend** | Spring Cloud Gateway | `api-gateway` | Cổng kết nối biên và định tuyến API. | Cho phép cấu hình định tuyến động, hiệu năng reactive cao và tích hợp các bộ lọc bảo mật biên dễ dàng. |
| **Backend** | Netflix Eureka Server | `eureka-server` | Đăng ký và phát hiện dịch vụ (Discovery). | Hỗ trợ sẵn sàng trong hệ sinh thái Spring Cloud giúp các microservice tự động đăng ký và tìm kiếm nhau qua tên ảo. |
| **Backend** | Spring Security | Dịch vụ `user`, `order`, `chat` | Bộ lọc xác thực và ủy quyền API. | Thư viện bảo mật tiêu chuẩn giúp kiểm soát truy cập phân quyền dựa trên vai trò, xác thực tiêu đề HTTP và xử lý token JWT. |
| **Backend** | Spring WebSocket (STOMP) | Dịch vụ `chat`, `notification` | Quản lý kết nối thời gian thực. | Hỗ trợ đẩy sự kiện trực tiếp từ server xuống client mà không cần chạy vòng lặp Polling gây quá tải băng thông, sử dụng chuẩn STOMP. |
| **Lưu trữ** | MySQL 8.0 | Các dịch vụ cốt lõi (Phân tách DB) | Cơ sở dữ liệu quan hệ. | Đảm bảo tính toàn vẹn của dữ liệu, hỗ trợ giao dịch phức tạp (ACID), hiệu năng tốt và phổ biến dễ triển khai. |
| **Lưu trữ** | Redis | Dịch vụ `user-service` | Cơ sở dữ liệu bộ nhớ đệm (Cache). | Cơ sở dữ liệu key-value trong bộ nhớ, tối ưu cho việc truy xuất và lưu trữ tạm thời Refresh Token nhờ cơ chế tự hủy qua TTL. |
| **Lưu trữ** | Elasticsearch 8.10.2 | Dịch vụ `product-service` (Dự phòng phát triển) | Công cụ tìm kiếm toàn văn. | Tìm kiếm dữ liệu lớn với tốc độ cao (được cấu hình sẵn để tích hợp nâng cấp về sau). |
| **Tin nhắn** | RabbitMQ 3 | Các dịch vụ xử lý sự kiện ngầm | Bộ môi giới tin nhắn (Message Broker). | Đảm bảo độ tin cậy khi gửi tin nhắn bất đồng bộ, tuân thủ tiêu chuẩn AMQP, chiếm ít bộ nhớ và hỗ trợ định tuyến exchange linh hoạt. |
| **Tích hợp** | VNPay Sandbox | Dịch vụ `payment-service` | Cổng thanh toán trực tuyến. | Cổng thanh toán phổ biến tại Việt Nam, cung cấp giao diện sandbox để kiểm thử thanh toán và xác thực mã HMAC an toàn. |
| **Phát triển** | Lombok | Tất cả các Microservice | Giảm thiểu mã nguồn lặp lại. | Tự động sinh ra các hàm Getter, Setter, Constructor, Builder và Logger thông qua các chú thích (annotations) khi biên dịch. |
| **Phát triển** | Docker & Docker Compose | Toàn bộ dự án | Đóng gói container và điều phối môi trường. | Đảm bảo hệ thống chạy đồng nhất giữa máy lập trình viên và máy chủ sản xuất nhờ việc đóng gói toàn bộ ứng dụng và hạ tầng. |
| **Kiểm thử** | JUnit & Mockito | Tất cả các Microservice | Viết mã kiểm thử tự động. | Thư viện tiêu chuẩn của Java cho phép viết kiểm thử đơn vị (Unit Test) và giả lập hành vi (Mocking) của các thành phần phụ thuộc. |
