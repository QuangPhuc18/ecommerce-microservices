# 09. Cấu trúc thư mục

Tài liệu này cung cấp sơ đồ thư mục toàn bộ dự án **ĐồCũ**, giải thích chi tiết mục đích và nhiệm vụ của từng thư mục trong frontend, gateway và các microservices backend.

---

## 1. Sơ đồ cây thư mục dự án

```
ecommerce-microservices/
│
├── .codegraph/                  # Cấu hình và dữ liệu chỉ mục mã nguồn CodeGraph
├── .github/                     # Các luồng tự động hóa CI/CD của GitHub Actions
│
├── docs/                        # Tài liệu hướng dẫn kỹ thuật của hệ thống
│   ├── 01-project-overview.md
│   ├── 02-system-architecture.md
│   ├── 03-microservices.md
│   ├── 04-technology-stack.md
│   ├── 05-workflow.md
│   ├── 06-database.md
│   ├── 07-api-flow.md
│   ├── 08-deployment.md
│   └── 09-folder-structure.md
│
├── frontend/                    # Mã nguồn ứng dụng giao diện React + Vite + Tailwind
│   ├── public/                  # Các tài nguyên tĩnh công khai (ảnh, biểu tượng)
│   ├── src/                     # Mã nguồn Javascript/React chính
│   │   ├── assets/              # Định nghĩa phong cách thiết kế, chuyển động CSS
│   │   ├── components/          # Các thành phần giao diện dùng chung (Navbar, Footer...)
│   │   ├── contexts/            # Quản lý trạng thái đăng nhập toàn cục (AuthContext)
│   │   ├── pages/               # Các trang giao diện chính của ứng dụng
│   │   └── services/            # Cấu hình máy khách Axios gọi API
│   │   ├── App.css              # Phong cách CSS cấp cơ sở của App
│   │   ├── App.jsx              # Khai báo định tuyến trang và khung bố cục chính
│   │   ├── index.css            # File nạp cấu hình Tailwind và tùy biến thiết kế
│   │   └── main.jsx             # Điểm khởi tạo và nạp React DOM vào index.html
│   ├── package.json             # Danh sách thư viện phụ thuộc và lệnh chạy npm
│   ├── tailwind.config.js       # Khai báo biến chủ đề và cấu hình Tailwind CSS
│   └── vite.config.js           # File cấu hình máy chủ chạy thử nghiệm Vite
│
└── backend/                     # Mã nguồn microservices Spring Boot quản lý bằng Maven
    ├── pom.xml                  # File Maven cấu hình chung cho toàn bộ dự án
    ├── docker-compose.yml       # File điều phối khởi chạy hệ thống container cục bộ
    ├── init-db.sql              # File tạo sẵn các cơ sở dữ liệu trên MySQL
    │
    ├── api-gateway/             # Dịch vụ cổng kết nối API Gateway biên (Port 8088)
    ├── eureka-server/           # Dịch vụ quản lý danh bạ khám phá Eureka (Port 8761)
    ├── user-service/            # Dịch vụ quản lý người dùng & đăng nhập (Port 8085)
    ├── product-service/         # Dịch vụ quản lý sản phẩm đăng bán (Port 8081)
    ├── order-service/           # Dịch vụ đặt đơn hàng giao dịch (Port 8082)
    ├── chat-service/            # Dịch vụ nhắn tin trao đổi trực tiếp (Port 8086)
    ├── media-service/           # Dịch vụ tải lên và lưu trữ ảnh (Port 8083)
    ├── notification-service/    # Dịch vụ quản lý gửi thông báo đẩy (Port 8087)
    ├── review-service/          # Dịch vụ chấm điểm uy tín & nhận xét (Port 8089)
    └── payment-service/         # Dịch vụ tích hợp cổng thanh toán VNPay (Port 8090)
```

---

## 2. Cấu trúc thư mục của một Microservice Backend

Mỗi dịch vụ microservice Java trong thư mục `backend/` tuân thủ đúng cấu trúc chuẩn của dự án Maven:

```
[service-module]/
│
├── src/
│   ├── main/
│   │   ├── java/com/example/[service_name]/
│   │   │   ├── config/          # Khai báo cấu hình hệ thống (WebSockets, Security, RabbitMQ)
│   │   │   ├── controller/      # Khai báo các endpoints nhận yêu cầu API REST
│   │   │   ├── dto/             # Các lớp trung chuyển dữ liệu (Request & Response DTOs)
│   │   │   ├── entity/          # Các thực thể JPA ánh xạ trực tiếp xuống bảng MySQL
│   │   │   ├── exception/       # Định nghĩa ngoại lệ và lớp bắt lỗi tập trung (Global Handler)
│   │   │   ├── listener/        # Lớp thu thập và xử lý các sự kiện hàng đợi RabbitMQ
│   │   │   ├── repository/      # Giao diện Spring Data JPA truy vấn cơ sở dữ liệu
│   │   │   ├── security/        # Bộ lọc xác thực và cấu hình phân tích token JWT
│   │   │   └── service/         # Các lớp chứa mã nguồn xử lý logic nghiệp vụ chính
│   │   │   └── [Application.java] # File chạy chính khởi động dịch vụ Spring Boot
│   │   │
│   │   └── resources/
│   │       ├── application.properties         # File cấu hình cấu hình chạy local
│   │       └── application-docker.properties  # File cấu hình ghi đè khi chạy trong Docker
│   │
│   └── test/                    # Các bộ mã chạy thử nghiệm tự động (Unit/Integration Tests)
│
├── Dockerfile                   # Hướng dẫn đóng gói ảnh Docker cho dịch vụ
└── pom.xml                      # Khai báo thư viện và cấu hình đóng gói Maven của module
```

---

## 3. Cấu trúc thư mục nguồn của Frontend

Các thư mục con trong `frontend/src/` được chia theo vai trò cấu trúc của React:

* **`components/`**: Chứa các component giao diện tĩnh hoặc phi trạng thái được dùng chung ở nhiều trang:
  * `Navbar.jsx`: Thanh điều hướng đầu trang chứa thanh tìm kiếm và menu thành viên.
  * `BottomNav.jsx`: Thanh điều hướng chân trang cho thiết bị di động.
  * `Footer.jsx`: Chân trang hiển thị thông tin bản quyền và liên kết.
  * `CategoryCarousel.jsx`: Băng chuyền hiển thị danh sách danh mục sản phẩm nằm ngang.
  * `HeroBanner.jsx`: Banner chào mừng lớn ở trang chủ.
  * `ProductList.jsx`: Khung lưới hiển thị danh sách các thẻ sản phẩm.
  * `AdminLayout.jsx`: Thanh điều hướng bố cục dành riêng cho admin.
* **`contexts/`**: Quản lý các Context toàn cục của React.
  * `AuthContext.jsx`: Giải mã thông tin email, role, userId từ token JWT trong `localStorage` để thiết lập trạng thái phiên đăng nhập của người dùng.
* **`pages/`**: Các trang chức năng chính của ứng dụng.
  * `Home.jsx` / `Search.jsx`: Trang chủ và trang tìm kiếm, lọc sản phẩm đồ cũ chi tiết.
  * `ProductDetail.jsx`: Hiển thị chi tiết thông số sản phẩm, đánh giá và nút trò chuyện.
  * `Chat.jsx`: Hộp trò chuyện trực tiếp (gọi API lấy tin nhắn liên tục).
  * `ManagePosts.jsx` / `PostProduct.jsx`: Quản lý các tin đã đăng và form đăng bán sản phẩm mới.
  * `SavedPosts.jsx`: Hiển thị danh sách các tin đăng mà người dùng bấm lưu.
  * `SellerProfile.jsx`: Xem trang hồ sơ cá nhân và lịch sử nhận xét của người bán khác.
  * `UserSettings.jsx`: Form chỉnh sửa thông tin tài khoản và đổi ảnh đại diện.
  * `Login.jsx` / `Register.jsx`: Biểu mẫu đăng nhập và tạo tài khoản mới.
  * `AdminUsers.jsx` / `AdminCategories.jsx` / `AdminProducts.jsx`: Các bảng quản lý dữ liệu dành cho admin.
* **`services/`**: Cấu hình liên lạc API.
  * `api.js`: Khởi tạo đối tượng Axios gọi tới cổng Gateway biên `http://localhost:8088`. Cấu hình bộ lọc Interceptor tự động thêm header `Authorization: Bearer <jwt_token>` nếu có token lưu trong máy.
* **`index.css`**: Định nghĩa bảng màu thiết kế, kiểu chữ hiển thị và các lớp hiệu ứng chuyển động tùy biến cho toàn hệ thống.
