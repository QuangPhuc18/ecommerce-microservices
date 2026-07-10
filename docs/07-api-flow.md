# 07. Luồng API (API Flow)

Tài liệu này chi tiết hóa các đặc tả API REST chính được định tuyến thông qua điểm trung chuyển **API Gateway (Cổng 8088)**.

---

## 1. Xác thực & Quản lý người dùng (`user-service`)

### 1.1 Đăng nhập người dùng
* **API**: `POST /auth/login` hoặc `POST /users/login`
* **Bảo mật**: Công khai (Public)
* **Nội dung Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "mypassword"
  }
  ```
* **Nội dung Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "7c8e9...",
    "userId": 1,
    "name": "Alex",
    "email": "user@example.com",
    "role": "USER"
  }
  ```
* **Ràng buộc**: Email phải đúng định dạng, mật khẩu không được bỏ trống.
* **Mã phản hồi**: `200 OK` (thành công), `400 Bad Request` (lỗi dữ liệu đầu vào), `401 Unauthorized` (sai tài khoản hoặc mật khẩu).

### 1.2 Đăng ký thành viên
* **API**: `POST /auth/register` hoặc `POST /users/register`
* **Bảo mật**: Công khai (Public)
* **Nội dung Request**:
  ```json
  {
    "name": "Alex",
    "email": "user@example.com",
    "password": "mypassword",
    "phone": "0987654321"
  }
  ```
* **Nội dung Response (200 OK)**: Tương tự như API đăng nhập (tự động đăng nhập và trả về token sau khi tạo tài khoản thành công).
* **Mã phản hồi**: `200 OK`, `400 Bad Request` (email đã tồn tại hoặc thiếu trường bắt buộc).

### 1.3 Làm mới token
* **API**: `POST /auth/refresh?refreshToken={token}`
* **Bảo mật**: Công khai (Public)
* **Nội dung Response (200 OK)**: Trả về Access Token mới và các thông tin cơ bản của người dùng.

---

## 2. Quản lý sản phẩm (`product-service`)

### 2.1 Tìm kiếm & Lọc danh mục
* **API**: `GET /products`
* **Bảo mật**: Công khai (Dành cho cả khách ẩn danh)
* **Tham số truy vấn (Query Parameters)**:
  * `keyword` (String) - Tìm kiếm cụm từ trong tên sản phẩm.
  * `category` (String) - Lọc chính xác theo tên danh mục.
  * `location` (String) - Lọc theo khu vực đăng tin.
  * `condition` (String) - Lọc tình trạng: `NEW` hoặc `USED`.
  * `status` (String) - Trạng thái bán: `AVAILABLE` hoặc `SOLD`.
  * `minPrice` / `maxPrice` (Double) - Khoảng giá trần và giá sàn.
  * `sellerId` (Long) - Xem toàn bộ tin đăng của một người bán cụ thể.
  * `page` (Integer) - Số thứ tự trang (Mặc định: `0`).
  * `size` (Integer) - Số sản phẩm trên mỗi trang (Mặc định: `20`).
* **Nội dung Response (200 OK)**: Trả về cấu trúc phân trang chuẩn của Spring:
  ```json
  {
    "content": [
      {
        "id": 1,
        "name": "Bàn làm việc cũ",
        "description": "Bàn gỗ còn tốt...",
        "price": 450000.0,
        "stock": 1,
        "category": "Furniture",
        "location": "Hà Nội",
        "itemCondition": "USED",
        "status": "AVAILABLE",
        "sellerId": 2,
        "imageUrls": ["/media/images/table.jpg"],
        "attributes": "{\"Material\":\"Oak\",\"Color\":\"Brown\"}",
        "createdAt": "2026-07-09T12:00:00",
        "bumpedAt": "2026-07-09T14:00:00",
        "approved": true
      }
    ],
    "pageable": { ... },
    "totalPages": 1,
    "totalElements": 1
  }
  ```

### 2.2 Đăng tin bán sản phẩm
* **API**: `POST /products`
* **Bảo mật**: Yêu cầu đính kèm token JWT (USER/ADMIN)
* **Nội dung Request**:
  ```json
  {
    "name": "Sofa cũ thanh lý",
    "description": "Sofa da mới 90%...",
    "price": 1200000.0,
    "stock": 1,
    "category": "Furniture",
    "location": "Hồ Chí Minh",
    "itemCondition": "USED",
    "imageUrls": ["/media/images/sofa.jpg"],
    "attributes": "{\"Type\":\"Leather\"}"
  }
  ```
* **Cơ chế hoạt động**: Gateway phân tích token, tự động chèn header `X-User-Id`. Dịch vụ `product-service` đọc header này để gán vào trường `sellerId`.
* **Nội dung Response (200 OK)**: Trả về thông tin sản phẩm đã tạo thành công.

---

## 3. Quản lý đơn hàng (`order-service`)

### 3.1 Đặt đơn hàng
* **API**: `POST /orders`
* **Bảo mật**: Yêu cầu đính kèm token JWT (USER/ADMIN)
* **Nội dung Request**:
  ```json
  {
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 1
      }
    ]
  }
  ```
* **Tương tác dịch vụ nội bộ**:
  1. `order-service` gọi REST sang `user-service` (`GET /users/1`) để kiểm tra tính hợp lệ của tài khoản mua hàng.
  2. Với từng sản phẩm (`productId = 1`), gọi REST sang `product-service` (`GET /products/1`) để lấy giá sản phẩm chính xác.
  3. Lưu thông tin đơn đặt hàng vào database.
  4. Đẩy chuỗi sự kiện thông báo vào RabbitMQ queue `order_queue`.
* **Nội dung Response (200 OK)**:
  ```json
  {
    "orderId": 5,
    "userId": 1,
    "userName": "Alex",
    "userEmail": "user@example.com",
    "items": [
      {
        "productId": 1,
        "productName": "Bàn làm việc cũ",
        "unitPrice": 450000.0,
        "quantity": 1,
        "subtotal": 450000.0
      }
    ],
    "totalAmount": 450000.0,
    "createdAt": "2026-07-10T09:12:00"
  }
  ```

---

## 4. Thương lượng & Chat (`chat-service`)

### 4.1 Khởi tạo hoặc Lấy phòng chat
* **API**: `POST /chat/rooms`
* **Bảo mật**: Yêu cầu đính kèm token JWT
* **Nội dung Request**:
  ```json
  {
    "sellerId": 2,
    "productId": 1
  }
  ```
* **Cơ chế hoạt động**: Tự động gán `buyerId` trích xuất từ tiêu đề `X-User-Id` do Gateway nhúng.
* **Nội dung Response (200 OK)**:
  ```json
  {
    "status": 200,
    "message": "Success",
    "data": {
      "id": 12,
      "buyerId": 1,
      "sellerId": 2,
      "productId": 1,
      "createdAt": "2026-07-10T09:13:00",
      "updatedAt": "2026-07-10T09:13:00"
    }
  }
  ```

### 4.2 Gửi tin nhắn vào phòng chat
* **API**: `POST /chat/rooms/{roomId}/messages`
* **Bảo mật**: Yêu cầu đính kèm token JWT
* **Nội dung Request**:
  ```json
  {
    "content": "Mình muốn thương lượng giá này ạ",
    "messageType": "TEXT" // Các loại hỗ trợ: TEXT, IMAGE, LOCATION
  }
  ```
* **Hành động**: Lưu tin nhắn vào cơ sở dữ liệu và đẩy sự kiện thông báo bất đồng bộ lên RabbitMQ `chat.exchange` bằng routing key `chat.notification.new`.

---

## 5. Đánh giá uy tín (`review-service`)

### 5.1 Gửi đánh giá cho người bán
* **API**: `POST /reviews`
* **Bảo mật**: Yêu cầu đính kèm token JWT
* **Nội dung Request**:
  ```json
  {
    "reviewerId": 1,
    "reviewedUserId": 2,
    "orderId": 5,
    "rating": 5,
    "comment": "Người bán thân thiện, giao hàng đúng hẹn!",
    "imageUrls": ["http://localhost:8088/media/images/package.jpg"]
  }
  ```
* **Nội dung Response (200 OK)**: Thông tin đánh giá đã lưu.
* **Ràng buộc**: Số sao đánh giá (`rating`) bắt buộc nằm trong khoảng từ 1 đến 5.

---

## 6. Giao dịch thanh toán (`payment-service`)

### 6.1 Tạo liên kết chuyển hướng thanh toán
* **API**: `POST /payments/create?amount={VND}&orderInfo={info}`
* **Bảo mật**: Công khai / Đăng nhập
* **Nội dung Response (200 OK)**:
  ```json
  {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45000000&vnp_Command=pay&vnp_CreateDate=20260710091200&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Order+5&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A5173%2Fpayment-return&vnp_TmnCode=ABC12345&vnp_TxnRef=171999999999&vnp_Version=2.1.0&vnp_SecureHash=abcdef123456..."
  }
  ```

### 6.2 Tiếp nhận và kiểm tra kết quả callback
* **API**: `GET /payments/vnpay-return`
* **Tham số**: Danh sách toàn bộ các tham số phản hồi tự động từ VNPay.
* **Bảo mật**: Công khai
* **Mã phản hồi**: `200 OK` (Thanh toán chữ ký hợp lệ và giao dịch thành công), `400 Bad Request` (Lỗi băm bảo mật hoặc sai lệch chữ ký).
