# 03. Tài liệu các Microservices

Tài liệu này cung cấp thông tin kỹ thuật chi tiết cho từng microservice trong hệ thống chợ đồ cũ **ĐồCũ**.

---

## 1. Eureka Server (Dịch vụ đăng ký & phát hiện)

### Mục đích
Đóng vai trò là danh bạ trung tâm để quản lý địa chỉ của các dịch vụ, cho phép API Gateway và các dịch vụ nội bộ tìm thấy nhau một cách động mà không cần cấu hình cứng IP.

* **Công nghệ**: Java 21, Spring Boot, Spring Cloud Netflix Eureka Server.
* **Cổng (Port)**: `8761`
* **Cấu hình chính**: Tắt chế độ tự bảo vệ (self-preservation) trong môi trường phát triển và cấu hình không tự đăng ký chính nó làm client.
* **Giao tiếp**: Nhận các yêu cầu đăng ký và nhịp tim (heartbeat) từ các microservice thông qua giao thức HTTP REST.

---

## 2. API Gateway (Cổng kết nối biên)

### Mục đích
Là điểm chạm duy nhất cho tất cả các kết nối từ phía client, giúp che giấu cấu trúc mạng nội bộ của các microservice phía sau.

* **Công nghệ**: Spring Cloud Gateway, WebFlux (Project Reactor).
* **Cổng (Port)**: `8088`
* **Nhiệm vụ chính**:
  * **Định tuyến tin cậy**: Ánh xạ các đường dẫn công khai (ví dụ: `/products/**`) đến các thực thể dịch vụ nội bộ tương ứng thông qua Eureka (`lb://product-service`).
  * **Bảo mật biên**: Sử dụng `AuthenticationFilter` để giải mã và kiểm tra chữ ký của Access Token JWT.
  * **Chèn ngữ cảnh**: Trích xuất dữ liệu người dùng từ token và nhúng các tiêu đề `X-User-Id` và `X-User-Role` vào yêu cầu chuyển tiếp downstream.
  * **Cấu hình CORS toàn cục**: Cho phép nhận yêu cầu từ mọi nguồn (`*`), hỗ trợ các phương thức GET, POST, PUT, DELETE, OPTIONS.
* **Đường dẫn không cần xác thực (Bypass Endpoints)**:
  * `/auth/register`, `/auth/login`, `/auth/refresh`
  * `/users/register`, `/users/login`
  * `/products/categories`
  * `/eureka`
  * `/v3/api-docs`, `/swagger-ui`
  * Các yêu cầu `GET` xem danh sách sản phẩm `/products/**` và tải ảnh công khai `/media/images/**`.

---

## 3. User Service (Dịch vụ người dùng & xác thực)

### Mục đích
Quản lý thông tin tài khoản người dùng, hồ sơ cá nhân và chịu trách nhiệm cấp phát/thu hồi token xác thực.

* **Công nghệ**: Spring Boot, Spring Security, Spring Data JPA, Redis.
* **Cổng (Port)**: `8085`
* **Cơ sở dữ liệu**: `user_db` (MySQL)
* **Bộ nhớ đệm**: Redis (quản lý Refresh Token với thời hạn 7 ngày).
* **Nhiệm vụ chính**:
  * **Đăng ký & Đăng nhập**: Mã hóa và so khớp mật khẩu bằng thư viện mã hóa BCrypt.
  * **Cấp phát Token**: Tạo Access Token JWT và Refresh Token. Lưu trữ Refresh Token vào Redis để kiểm soát phiên đăng nhập.
  * **Đăng xuất**: Xóa Refresh Token khỏi Redis để vô hiệu hóa phiên.
  * **Hồ sơ cá nhân**: Cập nhật thông tin hiển thị (tên, số điện thoại, đường dẫn ảnh đại diện).
* **Giao tiếp sự kiện**:
  * **Listener**: Lắng nghe hàng đợi `order_queue` để nhận thông tin khi người dùng tạo đơn hàng thành công, từ đó chạy tác vụ gửi email xác nhận.
* **Lý do lựa chọn công nghệ**: Spring Security cung cấp cấu trúc bộ lọc (Filter Chain) mạnh mẽ cho việc quản lý JWT. Redis là giải pháp tối ưu để lưu trữ Refresh Token nhờ tốc độ đọc ghi cực nhanh và hỗ trợ tự động hủy khóa qua TTL.
* **Cải tiến trong tương lai**: Bổ sung tính năng khôi phục mật khẩu qua mã OTP gửi về email, xác thực 2 lớp (2FA) và đăng nhập bằng tài khoản MXH (Google, Facebook).

---

## 4. Product Service (Dịch vụ sản phẩm & danh mục)

### Mục đích
Quản lý kho hàng đồ cũ, lưu trữ danh mục sản phẩm, xử lý các bộ lọc tìm kiếm nâng cao và danh sách tin đăng yêu thích.

* **Công nghệ**: Spring Boot, Spring Data JPA.
* **Cổng (Port)**: `8081`
* **Cơ sở dữ liệu**: `product_db` (MySQL)
* **Nhiệm vụ chính**:
  * **Nghiệp vụ CRUD**: Tạo mới, cập nhật thông tin và xóa tin đăng bán đồ cũ.
  * **Bộ lọc tìm kiếm động**: Áp dụng Spring Data Specification (`ProductSpecification`) để kết hợp linh hoạt nhiều điều kiện tìm kiếm (từ khóa, danh mục, vị trí, khoảng giá, tình trạng hao mòn, trạng thái bán).
  * **Đẩy tin (Bump)**: Cập nhật trường `bumpedAt` thành thời gian hiện tại giúp tin đăng được xếp lên đầu trang tìm kiếm.
  * **Tin yêu thích**: Quản lý việc đánh dấu lưu/hủy lưu sản phẩm của từng thành viên.
* **Lưu ý về Elasticsearch**:
  * Mã nguồn có tích hợp các thư viện và lớp repository của Elasticsearch (`ProductSearchRepository`, `ProductDocument`). Tuy nhiên, cấu hình tự động của Elasticsearch hiện đang bị loại trừ (`exclude`) trong `application.properties` để hệ thống tập trung tìm kiếm qua database MySQL bằng JPA Specification.
* **Lý do lựa chọn công nghệ**: Spring Data Specification giúp viết mã tìm kiếm động, đa tham số một cách tự nhiên và an toàn trước các cuộc tấn công SQL Injection.
* **Cải tiến trong tương lai**: Kích hoạt lại Elasticsearch để tìm kiếm văn bản toàn văn (full-text search) mượt mà hơn, hỗ trợ tìm kiếm không dấu và sửa lỗi chính tả. Bổ sung tiến trình định kỳ tự động ẩn các tin đăng quá hạn.

---

## 5. Order Service (Dịch vụ đơn hàng)

### Mục đích
Xử lý các giao dịch mua hàng, điều phối thông tin xác thực giữa người mua và sản phẩm và lưu trữ lịch sử mua bán.

* **Công nghệ**: Spring Boot, Spring Data JPA, `RestTemplate`.
* **Cổng (Port)**: `8082`
* **Cơ sở dữ liệu**: `order_db` (MySQL)
* **Nhiệm vụ chính**:
  * **Tạo đơn hàng**: Tiếp nhận yêu cầu mua sản phẩm kèm số lượng từ phía client.
  * **Xác thực đồng bộ**: Gọi sang `user-service` để kiểm tra tài khoản người mua và gọi sang `product-service` để xác nhận giá bán của sản phẩm.
  * **Phát sự kiện**: Sau khi lưu đơn hàng, gửi một chuỗi thông tin vào hàng đợi RabbitMQ `order_queue` để các dịch vụ khác tiêu thụ.
* **Lý do lựa chọn công nghệ**: Phân tách nghiệp vụ đơn hàng giúp bảo vệ dữ liệu tài chính giao dịch, tránh ảnh hưởng khi các luồng duyệt sản phẩm bị quá tải.
* **Cải tiến trong tương lai**: Áp dụng mẫu thiết kế Saga (Saga Pattern) để xử lý hoàn tiền hoặc hủy đơn hàng nếu có lỗi hệ thống xảy ra. Bổ sung trạng thái chi tiết cho đơn hàng (Chờ thanh toán, Đã xác nhận, Đang giao, Đã hoàn thành).

---

## 6. Chat Service (Dịch vụ nhắn tin)

### Mục đích
Cung cấp kênh liên lạc thời gian thực và lưu trữ lịch sử trò chuyện trực tiếp giữa người mua và người bán về một sản phẩm cụ thể.

* **Công nghệ**: Spring Boot, Spring Security, Spring Data JPA, Spring WebSocket (giao thức STOMP).
* **Cổng (Port)**: `8086`
* **Cơ sở dữ liệu**: `chat_db` (MySQL)
* **Nhiệm vụ chính**:
  * **Phòng chat**: Khởi tạo phòng chat duy nhất cho bộ ba `(buyerId, sellerId, productId)`.
  * **Lịch sử tin nhắn**: Lưu trữ nội dung tin nhắn (chữ, ảnh, liên kết vị trí GPS) vào cơ sở dữ liệu.
  * **Quản lý trạng thái đọc**: Đánh dấu tin nhắn đã đọc và trả về số lượng tin nhắn chưa đọc của người dùng.
  * **Truyền tải thời gian thực**: Đẩy tin nhắn trực tiếp qua kênh `/topic/chat/{roomId}` sử dụng kết nối WebSocket.
  * **Thông báo ngầm**: Bắn sự kiện định dạng `CHAT|sender|receiver|roomId|content` vào exchange `chat.exchange` để kích hoạt thông báo cho người nhận khi họ không ở trong phòng chat.
* **Lý do lựa chọn công nghệ**: Spring WebSocket hỗ trợ giao thức STOMP giúp dễ dàng chia sẻ và phân phối tin nhắn theo các kênh cụ thể mà không cần cài đặt các thư viện socket bên ngoài phức tạp.
* **Cải tiến trong tương lai**: Chuyển đổi mã nguồn React Client từ cơ chế Polling (gọi API lấy tin nhắn mỗi 3 giây) sang kết nối WebSocket STOMP hoàn chỉnh. Thêm tính năng hiển thị trạng thái "đang soạn tin" (typing indicators).

---

## 7. Media Service (Dịch vụ lưu trữ tệp tin)

### Mục đích
Đóng vai trò là kho chứa và phân phối các tệp tin hình ảnh sản phẩm và ảnh đại diện người dùng.

* **Công nghệ**: Spring Boot, Lưu trữ tập tin cục bộ (Local Filesystem).
* **Cổng (Port)**: `8083`
* **Cơ sở dữ liệu**: *Không sử dụng*
* **Nhiệm vụ chính**:
  * **Tải lên (Upload)**: Nhận các tệp tin đa phương tiện, tạo tên tệp ngẫu nhiên không trùng lặp, lưu trữ vào thư mục cấu hình (`./uploads`) và trả về đường dẫn tương đối.
  * **Truy xuất**: Đọc và trả về luồng dữ liệu hình ảnh kèm tiêu đề Content-Type phù hợp (PNG, JPEG, GIF) để trình duyệt hiển thị trực tiếp.
* **Lý do lựa chọn công nghệ**: Đơn giản hóa việc lưu trữ ảnh trong giai đoạn phát triển và thử nghiệm, giảm thiểu chi phí tích hợp bên thứ ba.
* **Cải tiến trong tương lai**: Tự động tối ưu hóa dung lượng ảnh, nén ảnh và cắt ảnh theo các tỷ lệ chuẩn khi tải lên. Chuyển đổi việc lưu trữ tập tin cục bộ sang dịch vụ lưu trữ đám mây (như AWS S3 hoặc MinIO) để dễ dàng nhân bản container.

---

## 8. Notification Service (Dịch vụ thông báo)

### Mục đích
Tiếp nhận các sự kiện nghiệp vụ và đẩy cảnh báo tức thời cho người dùng cuối.

* **Công nghệ**: Spring Boot, Spring Data JPA, Spring WebSocket (STOMP broker), `RestTemplate`.
* **Cổng (Port)**: `8087`
* **Cơ sở dữ liệu**: `notification_db` (MySQL)
* **Nhiệm vụ chính**:
  * **Tiêu thụ sự kiện (Consumer)**: Lắng nghe hàng đợi `chat_queue` của RabbitMQ.
  * **Làm giàu dữ liệu**: Khi nhận tin nhắn chat mới, gọi REST sang `user-service` để lấy tên đầy đủ của người gửi tin nhắn.
  * **Lưu trữ**: Lưu thông báo vào database với trạng thái chưa đọc.
  * **Đẩy thông báo**: Gửi tin nhắn chứa thông báo qua kênh WebSocket `/topic/notifications/{userId}` đến client.
* **Lý do lựa chọn công nghệ**: Việc xử lý thông báo bằng hàng đợi RabbitMQ giúp luồng gửi tin nhắn của người dùng không bị chậm trễ nếu hệ thống thông báo gặp sự cố hoặc phản hồi chậm.
* **Cải tiến trong tương lai**: Tích hợp thêm dịch vụ gửi email tự động và Firebase Cloud Messaging (FCM) để đẩy thông báo lên ứng dụng di động ngay cả khi người dùng tắt trình duyệt.

---

## 9. Review Service (Dịch vụ đánh giá)

### Mục đích
Quản lý các phản hồi, đánh giá điểm uy tín giữa người mua và người bán sau khi thực hiện giao dịch.

* **Công nghệ**: Spring Boot, Spring Data JPA.
* **Cổng (Port)**: `8089`
* **Cơ sở dữ liệu**: `review_db` (MySQL)
* **Nhiệm vụ chính**:
  * **Đăng đánh giá**: Lưu trữ điểm đánh giá từ 1 đến 5 sao, bình luận và danh sách ảnh chụp kèm theo.
  * **Phản hồi đánh giá**: Cho phép người bán viết câu trả lời phản hồi cho từng đánh giá.
  * **Tính điểm uy tín**: Tính toán điểm đánh giá trung bình của người bán để hiển thị công khai trên trang cá nhân.
* **Lý do lựa chọn công nghệ**: Cơ sở dữ liệu quan hệ giúp thực hiện các phép tính trung bình cộng (AVG) và truy vấn sắp xếp lịch sử đánh giá một cách nhanh chóng và chính xác.
* **Cải tiến trong tương lai**: Ràng buộc điều kiện đăng đánh giá: chỉ cho phép người mua đánh giá người bán khi có liên kết mã đơn hàng (`orderId`) đã hoàn thành, tránh tình trạng đánh giá ảo hoặc spam dìm uy tín.

---

## 10. Payment Service (Dịch vụ thanh toán)

### Mục đích
Xử lý các yêu cầu thanh toán không tiền mặt, tích hợp cổng thanh toán trực tuyến bên ngoài.

* **Công nghệ**: Spring Boot, VNPAY Sandbox API.
* **Cổng (Port)**: `8090`
* **Cơ sở dữ liệu**: *Không sử dụng (Dịch vụ phi trạng thái - Stateless)*
* **Nhiệm vụ chính**:
  * **Tạo liên kết thanh toán**: Tiếp nhận thông tin số tiền và mã đơn hàng, sắp xếp các tham số và ký mã hóa bằng thuật toán HMAC-SHA512 với khóa bí mật để sinh ra URL thanh toán VNPay.
  * **Xác thực kết quả**: Nhận cuộc gọi quay về (callback) từ VNPay, tính toán lại chữ ký HMAC-SHA512 để so sánh và xác minh kết quả giao dịch thành công/thất bại.
* **Lý do lựa chọn công nghệ**: Tách biệt luồng thanh toán ra một dịch vụ phi trạng thái giúp đảm bảo an toàn thông tin giao dịch, dễ dàng bảo trì khi có cập nhật từ phía nhà cung cấp cổng thanh toán.
* **Cải tiến trong tương lai**: Lưu trữ nhật ký giao dịch thanh toán vào cơ sở dữ liệu để phục vụ việc đối soát tài chính. Bắn tin nhắn sự kiện qua RabbitMQ về `order-service` để cập nhật trạng thái đơn hàng thành "Đã thanh toán" tự động khi VNPay trả kết quả thành công.
