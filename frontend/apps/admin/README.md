# Hướng dẫn chạy Admin Dashboard (React + TS + Vite)

Tài liệu hướng dẫn cài đặt và khởi chạy ứng dụng Frontend Admin Dashboard trong hệ thống Microservices.

---

## 1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo bạn đã cài đặt:
- **Node.js**: Phiên bản 18.x trở lên.
- **NPM**: Phiên bản 9.x trở lên (thường đi kèm với Node.js).

---

## 2. Các bước khởi chạy nhanh (Quick Start)

### Bước 2.1: Truy cập thư mục dự án
Di chuyển từ thư mục gốc của dự án vào thư mục của ứng dụng admin:
```bash
cd frontend/apps/admin
```

### Bước 2.2: Cài đặt các thư viện (Dependencies)
Tải và cài đặt các package cần thiết:
```bash
npm install
```

### Bước 2.3: Chạy ứng dụng ở chế độ Phát triển (Dev Mode)
Khởi chạy dev server cục bộ:
```bash
npm run dev -- --port 3001
```
> [!NOTE]
> Mặc định ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3001`. Bạn có thể thay đổi port tùy ý bằng tham số `--port`.

---

## 3. Cấu hình Biến Môi Trường (Environment Variables)

Ứng dụng kết nối tới hệ thống backend thông qua cổng **API Gateway** (mặc định chạy tại port `8080`).

Nếu bạn muốn thay đổi địa chỉ của API Gateway, hãy tạo một file `.env` tại thư mục `frontend/apps/admin/` và thêm cấu hình sau:
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 4. Các chức năng phục vụ kiểm thử (Test Cases & Flow)

Để kiểm tra đầy đủ hoạt động liên kết dữ liệu giữa frontend và backend, bạn có thể thực hiện theo thứ tự sau:

1. **Đăng ký Tài khoản Admin (Auto Role Promotion)**:
   - Truy cập giao diện đăng nhập tại `http://localhost:3001`.
   - Chọn **Register Admin**.
   - Điền thông tin đăng ký. **Quan trọng**: Email đăng ký phải chứa chữ `admin` (ví dụ: `admin@c2c.com` hoặc `superadmin@c2c.com`) để hệ thống backend tự động cấp quyền `ROLE_ADMIN`.
   
2. **Khởi tạo dữ liệu mẫu (Developer Sandbox Seeder)**:
   - Sau khi đăng nhập, chọn tab **Sandbox Seeder** trên thanh Sidebar.
   - Nhấp vào nút **Seed Product** để tạo nhanh sản phẩm thử nghiệm trong cơ sở dữ liệu của `product-service`.
   - Sau khi tạo sản phẩm thành công, Product ID mới tạo sẽ tự động điền vào form **Seed Test Order**. Nhấn **Seed Order** để tạo một đơn hàng mẫu (kích hoạt Saga Transaction điều phối qua các microservices).

3. **Quản lý dữ liệu hệ thống**:
   - Tab **Products**: Xem danh sách sản phẩm, cập nhật trạng thái hoạt động (`ACTIVE`, `INACTIVE`, `SOLD`, `HIDDEN`) hoặc gửi báo cáo xấu (complaint).
   - Tab **Reports**: Xem và giải quyết (`Resolve`) các khiếu nại sản phẩm từ người dùng.
   - Tab **Orders**: Xem toàn bộ đơn hàng trong hệ thống và cập nhật trạng thái đơn hàng (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`).
   - Tab **System Logs**: Theo dõi lịch sử lưu vết hoạt động quản trị viên do `analytics-service` ghi nhận.

---

## 5. Build cho Production

Khi cần đóng gói ứng dụng để triển khai thực tế:
```bash
npm run build
```
Sản phẩm đầu ra sẽ nằm trong thư mục `dist/`.

---

# Admin Dashboard Run Instructions (English Version)

Documentation guide for setting up and running the Admin Dashboard frontend application.

## 1. Prerequisites
- **Node.js**: Version 18.x or higher.
- **NPM**: Version 9.x or higher.

## 2. Quick Start

### Step 2.1: Navigate to directory
```bash
cd frontend/apps/admin
```

### Step 2.2: Install dependencies
```bash
npm install
```

### Step 2.3: Run Development Server
```bash
npm run dev -- --port 3001
```
*Access the local web server at `http://localhost:3001`.*

## 3. Environment Variables
To customize the API Gateway endpoint target, create a `.env` file under the `frontend/apps/admin/` folder:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 4. Production Build
```bash
npm run build
```
*Production files will be generated in the `dist/` directory.*
