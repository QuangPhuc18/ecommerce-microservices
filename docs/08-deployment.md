# 08. Triển khai hệ thống (Deployment)

Tài liệu này hướng dẫn cách đóng gói container, cấu hình biến môi trường, mạng, phân vùng lưu trữ và các bước chạy hệ thống chợ đồ cũ **ĐồCũ** ở môi trường cục bộ.

---

## 1. Đóng gói container (Docker)

Mỗi microservice sở hữu một file cấu hình `Dockerfile` nằm tại thư mục gốc của module đó.

### Thiết kế Dockerfile
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE <PORT>
ENTRYPOINT ["java", "-jar", "app.jar"]
```
* **Base Image**: `eclipse-temurin:21-jre-alpine` (môi trường thực thi Java 21 gọn nhẹ trên nhân Linux Alpine giúp tối thiểu dung lượng ảnh).
* **Cổng kết nối**: Mở cổng mạng tương ứng với cấu hình chạy dịch vụ.
* **Quy trình build**: Quá trình đóng gói docker phụ thuộc vào file JAR đã được biên dịch sẵn trong thư mục `target/` bằng lệnh Maven trên máy chủ host trước đó.

---

## 2. Điều phối container cục bộ (Docker Compose)

Các container dịch vụ và hạ tầng bổ trợ được quản lý tập trung thông qua file `backend/docker-compose.yml`.

### 2.1 Các dịch vụ và ánh xạ cổng
| Tên Container | Hình ảnh / Thư mục ngữ cảnh | Cổng nội bộ | Cổng công khai | Vai trò |
| --- | --- | --- | --- | --- |
| `microservice-mysql` | `mysql:8.0` | `3306` | `3307` | Hệ quản trị cơ sở dữ liệu MySQL tập trung. |
| `microservice-redis` | `redis:alpine` | `6379` | `6379` | Cơ sở dữ liệu lưu trữ Refresh Token của người dùng. |
| `microservice-elasticsearch` | `elasticsearch:8.10.2` | `9200` | `9200` | Công cụ phục vụ tìm kiếm nâng cao (Tạm thời chưa kích hoạt). |
| `microservice-rabbitmq` | `rabbitmq:3-management` | `5672`, `15672` | `5672`, `15672` | Broker trung chuyển tin nhắn bất đồng bộ & trang quản lý UI. |
| `microservice-eureka` | `./eureka-server` | `8761` | `8761` | Máy chủ Netflix Eureka lưu danh bạ dịch vụ. |
| `microservice-gateway` | `./api-gateway` | `8088` | `8088` | API Gateway (Điểm chạm duy nhất của client). |
| `microservice-user` | `./user-service` | `8085` | `8085` | Dịch vụ quản lý xác thực & thông tin tài khoản. |
| `microservice-product` | `./product-service` | `8081` | `8081` | Dịch vụ quản lý sản phẩm đăng bán & danh mục. |
| `microservice-order` | `./order-service` | `8082` | `8082` | Dịch vụ quản lý đặt hàng. |
| `microservice-chat` | `./chat-service` | `8086` | `8086` | Dịch vụ nhắn tin thương lượng giá cả. |
| `microservice-media` | `./media-service` | `8083` | `8083` | Dịch vụ upload và phân phối hình ảnh. |
| `microservice-notification` | `./notification-service` | `8087` | `8087` | Dịch vụ đẩy cảnh báo cho người dùng. |
| `microservice-review` | `./review-service` | `8089` | `8089` | Dịch vụ đánh giá độ uy tín người bán. |
| `microservice-payment` | `./payment-service` | `8090` | `8090` | Dịch vụ tích hợp thanh toán ngân hàng VNPay. |

### 2.2 Cấu trúc mạng nội bộ (Network)
Tất cả các container giao tiếp với nhau trong một mạng cầu riêng biệt:
* **Tên mạng**: `microservice-network`
* **Driver**: `bridge`
* **Mục đích**: Cho phép các microservice gọi trực tiếp các dịch vụ hạ tầng thông qua tên service của chúng (ví dụ: `mysql:3306`, `rabbitmq:5672`, `eureka-server:8761`) thay vì phải phân giải qua địa chỉ IP của máy chủ.

### 2.3 Phân vùng lưu trữ dữ liệu (Volumes)
Để dữ liệu không bị mất khi khởi động lại hoặc xóa container, hai volume được thiết lập:
1. `mysql_data`: Gắn với đường dẫn `/var/lib/mysql` trong container `microservice-mysql` để bảo vệ dữ liệu các bảng cơ sở dữ liệu.
2. `media_data`: Gắn với `/app/uploads` trong container `microservice-media` để bảo vệ các tệp ảnh sản phẩm và avatar được tải lên.

---

## 3. Trạng thái Kubernetes (K8s)

> [!NOTE]
> Hiện tại, dự án chưa cấu hình các tệp tin manifest để chạy trên cụm Kubernetes. Việc triển khai được thực hiện duy nhất bằng công cụ Docker Compose.

---

## 4. Phân tách cấu hình bằng Profile

Hệ thống cấu hình sẵn **Spring Boot Profiles** để phân biệt môi trường chạy độc lập cục bộ và môi trường chạy đóng gói container:

### Docker Profile
Khi chạy qua Docker Compose, biến môi trường `SPRING_PROFILES_ACTIVE=docker` được truyền vào. Điều này kích hoạt file `application-docker.properties` của các microservice để chuyển hướng kết nối:
* **Chạy Local thông thường**: Dịch vụ kết nối database qua `jdbc:mysql://localhost:3306/...` và RabbitMQ qua `localhost`.
* **Chạy qua Docker**: Dịch vụ kết nối database qua `jdbc:mysql://mysql:3306/...` và RabbitMQ qua `rabbitmq`.

---

## 5. Hướng dẫn biên dịch và khởi chạy

### Yêu cầu cài đặt sẵn
* Bộ công cụ Java 21 JDK.
* Phần mềm đóng gói Apache Maven.
* Ứng dụng Docker & Docker Desktop.
* Node.js (để khởi chạy ứng dụng frontend).

### Quy trình khởi chạy chi tiết

#### Bước 1: Biên dịch mã nguồn Backend
Di chuyển vào thư mục `backend/` và đóng gói các module Spring Boot thành tệp JAR:
```bash
cd backend
mvn clean package -DskipTests
```
Lệnh này sẽ dọn dẹp các bản build cũ và tạo ra file `.jar` mới trong thư mục `target/` của từng module dịch vụ.

#### Bước 2: Khởi động các container dịch vụ
Chạy lệnh Docker Compose để build ngữ cảnh và khởi chạy các container chạy ngầm:
```bash
docker compose up --build -d
```
Kiểm tra xem toàn bộ các container đã hoạt động bình thường chưa:
```bash
docker compose ps
```

#### Bước 3: Khởi chạy ứng dụng React Frontend
Di chuyển sang thư mục `frontend/`, tải về các gói thư viện NPM và khởi động máy chủ thử nghiệm Vite:
```bash
cd ../frontend
npm install
npm run dev
```
Mặc định ứng dụng frontend sẽ được phân phối tại địa chỉ `http://localhost:5173`.
Toàn bộ các API từ frontend sẽ tự động gọi qua cổng Gateway biên `http://localhost:8088`.
Giao diện quản lý danh bạ Eureka có thể truy cập tại `http://localhost:8761`.
Bảng điều khiển RabbitMQ hoạt động tại `http://localhost:15672` (tài khoản mặc định: `guest` / `guest`).
