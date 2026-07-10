# 05. Tài liệu quy trình nghiệp vụ (Workflow)

Tài liệu này theo dõi các luồng xử lý đầu cuối (end-to-end) của các nghiệp vụ quan trọng trong nền tảng chợ đồ cũ **ĐồCũ**.

---

## 1. Luồng đăng ký & đăng nhập

### Mô tả
Tạo tài khoản mới hoặc xác thực thông tin đăng nhập của thành viên để bắt đầu một phiên làm việc có bảo mật.

### Các bước xử lý
1. Người dùng nhập thông tin đăng ký/đăng nhập trên giao diện frontend.
2. Yêu cầu được gửi đến `api-gateway`. Gateway kiểm tra và chuyển tiếp không xác thực đến `user-service`.
3. Đối với luồng đăng ký:
   * `user-service` kiểm tra tính duy nhất của email trong database.
   * Mã hóa mật khẩu bằng thư viện BCrypt.
   * Lưu bản ghi `User` mới vào cơ sở dữ liệu `user_db`.
4. Đối với luồng đăng nhập:
   * `user-service` tìm người dùng theo email và thực hiện so khớp mật khẩu mã hóa.
5. Cấp phát cặp token: Access Token (JWT hết hạn sau 24 giờ) và Refresh Token (hết hạn sau 7 ngày).
6. Lưu Refresh Token vào bộ nhớ đệm Redis với khóa (`RT:<email>`).
7. Trả lại thông tin hai token về cho Client. Giao diện frontend lưu JWT vào `localStorage` để đính kèm cho các request tiếp theo.

### Sơ đồ tuần tự (Sequence Diagram)
```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Người dùng)
    participant GW as API Gateway
    participant US as User Service
    participant Redis as Redis Cache
    participant DB as MySQL (user_db)

    User->>GW: POST /auth/login
    GW->>US: Chuyển tiếp POST /auth/login
    US->>DB: Truy vấn User theo Email
    DB-->>US: Trả về thông tin User (Mật khẩu mã hóa)
    US->>US: So khớp mật khẩu (BCrypt check)
    US->>Redis: Lưu Refresh Token (RT:email, 7 ngày TTL)
    US-->>GW: Trả về Access Token (JWT) & Refresh Token
    GW-->>User: Trả về Token (Lưu vào LocalStorage)
```

---

## 2. Luồng đăng tin & Phê duyệt sản phẩm

### Mô tả
Người bán đăng sản phẩm cũ lên hệ thống, tin đăng này có thể cần đi qua bộ lọc kiểm duyệt của Quản trị viên trước khi hiển thị công khai.

### Các bước xử lý
1. Người bán chọn tải lên hình ảnh sản phẩm. Các ảnh này được gửi đến `media-service` để lưu trữ và nhận lại các đường dẫn tương đối.
2. Người bán điền thông tin chi tiết sản phẩm và gửi request. Gateway tự động đính kèm header `X-User-Id` để định danh người bán.
3. Dịch vụ `product-service` lưu trữ thông tin sản phẩm vào database `product_db` với trạng thái mặc định ban đầu là `AVAILABLE` và cờ phê duyệt `isApproved = true` (được cấu hình mặc định tự động duyệt trong môi trường thử nghiệm, hoặc `false` nếu yêu cầu duyệt nghiêm ngặt).
4. Quản trị viên có thể vào trang admin và phê duyệt sản phẩm thủ công bằng cách gọi API `PUT /admin/products/{id}/approve?approved=true`.
5. Dịch vụ `product-service` cập nhật cờ `is_approved = true` giúp sản phẩm xuất hiện công khai trên giao diện tìm kiếm.

### Sơ đồ tuần tự (Sequence Diagram)
```mermaid
sequenceDiagram
    autonumber
    actor Seller as Client (Người bán)
    participant GW as API Gateway
    participant MS as Media Service
    participant PS as Product Service
    participant DB as MySQL (product_db)
    actor Admin as Client (Quản trị viên)

    %% Tải ảnh lên
    Seller->>GW: POST /media/upload (Multipart Form Data)
    GW->>MS: Chuyển tiếp đến Media Service
    MS->>MS: Lưu ảnh vào thư mục cục bộ ./uploads
    MS-->>GW: Trả về đường dẫn ảnh tương đối (/media/images/xxx.png)
    GW-->>Seller: Danh sách link ảnh sản phẩm

    %% Đăng sản phẩm
    Seller->>GW: POST /products (Thông tin sản phẩm + Danh sách ảnh)
    Note over GW: Xác thực JWT, chèn tiêu đề X-User-Id
    GW->>PS: Chuyển tiếp kèm X-User-Id
    PS->>DB: Lưu sản phẩm (approved=true, status=AVAILABLE)
    DB-->>PS: Trả về thông tin sản phẩm đã lưu
    PS-->>GW: Phản hồi tạo sản phẩm thành công
    GW-->>Seller: Báo đăng tin thành công

    %% Duyệt sản phẩm
    Admin->>GW: PUT /admin/products/{id}/approve?approved=true
    GW->>PS: Chuyển tiếp yêu cầu phê duyệt
    PS->>DB: Cập nhật trường is_approved = true
    DB-->>PS: Đã lưu thay đổi
    PS-->>GW: Trả kết quả thành công
    GW-->>Admin: Duyệt tin đăng thành công
```

---

## 3. Luồng tìm kiếm & xem chi tiết sản phẩm

### Mô tả
Người mua tìm kiếm danh mục sản phẩm theo bộ lọc và nhấp chọn xem chi tiết một tin đăng cụ thể bao gồm cả uy tín của người bán.

### Các bước xử lý
1. Người mua thực hiện tìm kiếm bằng cách truyền các tham số lọc (từ khóa, danh mục, khoảng giá, vị trí).
2. API Gateway chuyển tiếp yêu cầu đến `product-service`. Do đây là hành vi xem công khai, Gateway cho phép đi qua không cần token.
3. Dịch vụ `product-service` tạo truy vấn SQL động dựa trên Specification và trả về danh sách sản phẩm.
4. Khi người mua nhấp xem chi tiết một sản phẩm, frontend gọi API `GET /products/{id}` để hiển thị ảnh, thông số attributes và mô tả.
5. Đồng thời, frontend chạy các request song song:
   * `GET /users/{sellerId}` để hiển thị tên và avatar của người bán.
   * `GET /reviews/user/{sellerId}/rating` để lấy điểm đánh giá trung bình của người bán.
   * `GET /reviews/user/{sellerId}` để lấy danh sách các nhận xét từ những người mua trước.

---

## 4. Luồng đặt hàng (Order Placement)

### Mô tả
Người dùng thực hiện mua sản phẩm, kích hoạt các cuộc gọi đồng bộ để kiểm tra chéo thông tin và bắn sự kiện bất đồng bộ khi hoàn thành.

### Các bước xử lý
1. Người mua nhấp mua sản phẩm. Frontend gửi yêu cầu đặt hàng đến `/orders` (chứa `userId` và danh sách sản phẩm kèm số lượng).
2. Dịch vụ `order-service` tiếp nhận yêu cầu và xác thực tài khoản qua JWT.
3. `order-service` thực hiện cuộc gọi REST đồng bộ tới `user-service` (`GET /users/{userId}`) để đảm bảo tài khoản mua hàng tồn tại và hoạt động hợp lệ.
4. `order-service` duyệt qua từng sản phẩm trong đơn, gọi đồng bộ tới `product-service` (`GET /products/{productId}`) để lấy tên sản phẩm và kiểm tra giá bán thực tế.
5. Hệ thống tính toán tổng số tiền, lưu thông tin vào các bảng `orders` và `order_items` trong database `order_db`.
6. Bắn một tin nhắn văn bản thông báo đặt hàng thành công vào hàng đợi RabbitMQ `order_queue`.
7. Dịch vụ `user-service` lắng nghe từ hàng đợi, nhận thông báo đặt hàng và mô phỏng tác vụ gửi email thông báo xác nhận đơn hàng trong nền.

### Sơ đồ tuần tự (Sequence Diagram)
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Client (Người mua)
    participant GW as API Gateway
    participant OS as Order Service
    participant US as User Service
    participant PS as Product Service
    participant DB as MySQL (order_db)
    participant MQ as RabbitMQ Broker

    Buyer->>GW: POST /orders (userId, danh sách sản phẩm)
    GW->>OS: Chuyển tiếp tới Order Service (Xác thực JWT)
    
    OS->>US: GET /users/{userId} (Kiểm tra người dùng)
    US-->>OS: Thông tin người dùng (tên, email)
    
    loop duyệt từng sản phẩm
        OS->>PS: GET /products/{productId} (Kiểm tra sản phẩm)
        PS-->>OS: Chi tiết sản phẩm (tên, giá tiền)
    end
    
    OS->>OS: Tính tổng tiền đơn hàng
    OS->>DB: Lưu Đơn hàng & Chi tiết đơn hàng
    DB-->>OS: Trả về đơn hàng đã lưu
    
    OS->>MQ: Gửi tin nhắn vào order_queue
    Note over MQ,US: User Service nhận tin nhắn và xử lý gửi email xác nhận ngầm
    
    OS-->>GW: Trả về kết quả tạo đơn hàng
    GW-->>Buyer: Hiển thị Đơn hàng đã đặt thành công
```

---

## 5. Luồng thanh toán trực tuyến (VNPay Integration)

### Mô tả
Tạo liên kết để khách hàng thanh toán qua ngân hàng, nhận kết quả mã hóa từ cổng thanh toán để xác nhận giao dịch.

### Các bước xử lý
1. Người mua nhấn chọn thanh toán, frontend gửi yêu cầu tới `POST /payments/create?amount=...&orderInfo=...`.
2. Dịch vụ `payment-service` tiếp nhận, lấy cấu hình merchant (`vnp_TmnCode`).
3. Sắp xếp các tham số thanh toán theo thứ tự bảng chữ cái, sử dụng khóa bí mật (`vnp_HashSecret`) để tính mã băm HMAC-SHA512 (`vnp_SecureHash`).
4. Trả URL thanh toán hoàn chỉnh về cho client. Frontend chuyển hướng người dùng sang trang thanh toán của VNPay.
5. Người dùng nhập thẻ ngân hàng và thanh toán thành công. VNPay chuyển hướng người dùng quay lại đường dẫn Return URL (`/payments/vnpay-return`).
6. Dịch vụ `payment-service` tiếp nhận các tham số phản hồi, loại bỏ chữ ký cũ, tiến hành băm lại dữ liệu bằng khóa bí mật và so sánh đối chiếu chữ ký.
7. Nếu chữ ký trùng khớp và mã phản hồi `vnp_ResponseCode == "00"`, giao dịch được xác thực là thanh toán thành công.

### Sơ đồ tuần tự (Sequence Diagram)
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Client (Người mua)
    participant GW as API Gateway
    participant PM as Payment Service
    participant VN as Cổng VNPay

    Buyer->>GW: POST /payments/create?amount=X&orderInfo=Y
    GW->>PM: Chuyển tiếp yêu cầu thanh toán
    PM->>PM: Tạo mã băm bảo mật HMAC-SHA512
    PM-->>GW: Trả về paymentUrl
    GW-->>Buyer: Trả về paymentUrl
    
    Buyer->>VN: Trình duyệt chuyển hướng sang trang thanh toán VNPay
    Note over VN: Người dùng thực hiện thanh toán qua tài khoản/thẻ
    VN-->>Buyer: Chuyển hướng quay lại trang Return URL của Client
    
    Buyer->>GW: GET /payments/vnpay-return?vnp_SecureHash=...&vnp_ResponseCode=00
    GW->>PM: Chuyển tiếp các tham số callback của VNPay
    PM->>PM: Xác thực chữ ký HMAC-SHA512
    PM->>PM: Kiểm tra mã phản hồi vnp_ResponseCode == "00"
    PM-->>GW: Trả về kết quả "Thanh toán thành công"
    GW-->>Buyer: Hiển thị màn hình Thanh toán đơn hàng thành công
```

---

## 6. Luồng chat trực tiếp & thông báo ngoại tuyến

### Mô tả
Hai người dùng trò chuyện thương lượng trực tiếp, hệ thống kích hoạt thông báo ngầm nếu đối phương không online trong phòng chat.

### Các bước xử lý
1. Người gửi nhập nội dung và bấm gửi tin nhắn trong giao diện chat.
2. Dịch vụ `chat-service` lưu tin nhắn mới vào bảng `chat_messages` trong database `chat_db`.
3. `chat-service` đẩy trực tiếp tin nhắn qua kênh WebSocket `/topic/chat/{roomId}` để hiển thị tức thời nếu đối phương đang mở phòng chat.
4. Đồng thời, `chat-service` tạo chuỗi sự kiện `CHAT|senderId|receiverId|roomId|content` và đẩy vào exchange `chat.exchange` của RabbitMQ.
5. Dịch vụ `notification-service` lắng nghe từ hàng đợi `chat_queue` và tiêu thụ tin nhắn này.
6. `notification-service` thực hiện cuộc gọi REST đồng bộ tới `user-service` để lấy tên đầy đủ của người gửi.
7. Tạo bản ghi thông báo mới với cờ `isRead = false` trong database `notification_db`.
8. Đẩy cảnh báo tin nhắn mới qua kênh WebSocket `/topic/notifications/{receiverId}` để hiển thị thông báo góc màn hình và cập nhật số lượng thông báo chưa đọc trên thanh điều hướng của người nhận.

### Sơ đồ tuần tự (Sequence Diagram)
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Client (Người mua)
    participant GW as API Gateway
    participant CS as Chat Service
    participant MQ as RabbitMQ Broker
    participant NS as Notification Service
    participant US as User Service
    actor Seller as Client (Người bán)

    Buyer->>GW: POST /chat/rooms/{roomId}/messages (Nội dung)
    GW->>CS: Chuyển tiếp tới Chat Service (Xác thực JWT)
    CS->>CS: Lưu tin nhắn vào bảng chat_messages
    
    CS->>MQ: Gửi sự kiện "CHAT|buyerId|sellerId|roomId|content" lên chat.exchange
    CS-->>GW: Trả về tin nhắn đã lưu
    GW-->>Buyer: Báo gửi tin nhắn thành công
    
    Note over MQ,NS: RabbitMQ Listener kích hoạt ngầm
    MQ->>NS: Truyền tin nhắn đến CHAT_QUEUE của Notification Service
    NS->>US: GET /users/{buyerId} (Lấy tên người gửi)
    US-->>NS: Trả về thông tin người dùng (Tên: "An")
    NS->>NS: Lưu bản ghi thông báo (An đã nhắn tin: content)
    NS->>GW: Đẩy thông báo qua kênh /topic/notifications/{sellerId}
    GW-->>Seller: Cập nhật số thông báo chưa đọc / Hiển thị Toaster
```

---

## 7. Các hạn chế và thiếu sót về mặt kiến trúc hiện tại

* **Chưa có luồng trừ kho**: Khi tạo đơn hàng thành công trong `order-service`, hệ thống chỉ kiểm tra thông tin và lưu đơn chứ chưa thực hiện trừ đi số lượng tồn kho (`stock` của sản phẩm tại `product-service`).
* **Chưa liên kết trạng thái thanh toán**: Khi thanh toán thành công qua VNPay tại `payment-service`, hệ thống chỉ ghi nhận kết quả thành công và ghi log chứ chưa thực hiện gọi API hay bắn tin nhắn để cập nhật trạng thái đơn hàng của `order-service` từ "Chưa thanh toán" sang "Đã thanh toán".
* **Sử dụng cơ chế Polling thay vì WebSocket hoàn chỉnh ở Frontend**: Mặc dù backend đã cấu hình đầy đủ máy chủ WebSocket STOMP cho tin nhắn chat và thông báo, ứng dụng React Frontend hiện tại vẫn sử dụng bộ định thời `setInterval` (3 giây để lấy tin nhắn, 5 giây để lấy thông báo) để lấy dữ liệu từ các API REST thường.
