# 07. API Flow

This document details the REST API specifications exposed through the central **API Gateway (Port 8088)**.

---

## 1. Authentication & User Management (`user-service`)

### 1.1 User Login
* **Endpoint**: `POST /auth/login` or `POST /users/login`
* **Security**: Public
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "mypassword"
  }
  ```
* **Response (200 OK)**:
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
* **Validation**: Email must be valid format, password cannot be blank.
* **Status Codes**: `200 OK` (success), `400 Bad Request` (validation error), `401 Unauthorized` (incorrect credentials).

### 1.2 User Registration
* **Endpoint**: `POST /auth/register` or `POST /users/register`
* **Security**: Public
* **Request Body**:
  ```json
  {
    "name": "Alex",
    "email": "user@example.com",
    "password": "mypassword",
    "phone": "0987654321"
  }
  ```
* **Response (200 OK)**: Same payload as User Login (automatically logs the user in).
* **Status Codes**: `200 OK`, `400 Bad Request` (email in use/validation failed).

### 1.3 Token Refresh
* **Endpoint**: `POST /auth/refresh?refreshToken={token}`
* **Security**: Public
* **Response (200 OK)**: Returns a newly generated `token` along with user details.

---

## 2. Product Catalog (`product-service`)

### 2.1 Search & Filter Listings
* **Endpoint**: `GET /products`
* **Security**: Public (Guest accessible)
* **Query Parameters**:
  * `keyword` (String) - Search in title.
  * `category` (String) - Match exact category.
  * `location` (String) - Match location.
  * `condition` (String) - `NEW` or `USED`.
  * `status` (String) - `AVAILABLE` or `SOLD`.
  * `minPrice` / `maxPrice` (Double) - Price boundaries.
  * `sellerId` (Long) - Search items posted by a specific seller.
  * `page` (Integer) - Page index (Default: `0`).
  * `size` (Integer) - Listings per page (Default: `20`).
* **Response (200 OK)**: Returns a Spring Page JSON wrapper:
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

### 2.2 Create Listing
* **Endpoint**: `POST /products`
* **Security**: Requires JWT (User/Admin)
* **Request Body**:
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
* **Context Interaction**: The Gateway injects the buyer's ID as `X-User-Id`. `product-service` extracts this header and assigns it to `sellerId`.
* **Response (200 OK)**: Returns the saved Product entity.

---

## 3. Order Management (`order-service`)

### 3.1 Create Order
* **Endpoint**: `POST /orders`
* **Security**: Requires JWT (User/Admin)
* **Request Body**:
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
* **Service Interactions**:
  1. `order-service` queries `user-service` via HTTP REST (`GET /users/1`) to check if the buyer is registered.
  2. For item product ID `1`, it queries `product-service` (`GET /products/1`) to retrieve the current price.
  3. Saves the record to its DB.
  4. Publishes a text alert to RabbitMQ queue `order_queue`.
* **Response (200 OK)**:
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

## 4. Negotiation Chat (`chat-service`)

### 4.1 Create or Retrieve Chat Room
* **Endpoint**: `POST /chat/rooms`
* **Security**: Requires JWT
* **Request Body**:
  ```json
  {
    "sellerId": 2,
    "productId": 1
  }
  ```
* **Context Interaction**: Assigns `buyerId` from the request header `X-User-Id`.
* **Response (200 OK)**:
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

### 4.2 Send Message in Chat Room
* **Endpoint**: `POST /chat/rooms/{roomId}/messages`
* **Security**: Requires JWT
* **Request Body**:
  ```json
  {
    "content": "Mình muốn thương lượng giá này ạ",
    "messageType": "TEXT" // Type can be TEXT, IMAGE, LOCATION
  }
  ```
* **Event Action**: Publishes message details to RabbitMQ `chat.exchange` using the routing key `chat.notification.new`.

---

## 5. Review & Rating System (`review-service`)

### 5.1 Submit Seller Review
* **Endpoint**: `POST /reviews`
* **Security**: Requires JWT
* **Request Body**:
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
* **Response (200 OK)**: Saved Review entity.
* **Validation**: Rating must be between 1 and 5.

---

## 6. Payment Processing (`payment-service`)

### 6.1 Create Payment Redirect URL
* **Endpoint**: `POST /payments/create?amount={VND}&orderInfo={info}`
* **Security**: Public / Authenticated
* **Response (200 OK)**:
  ```json
  {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45000000&vnp_Command=pay&vnp_CreateDate=20260710091200&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Order+5&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A5173%2Fpayment-return&vnp_TmnCode=ABC12345&vnp_TxnRef=171999999999&vnp_Version=2.1.0&vnp_SecureHash=abcdef123456..."
  }
  ```

### 6.2 Process Callback Return
* **Endpoint**: `GET /payments/vnpay-return`
* **Parameters**: Full query param list returned from VNPay.
* **Security**: Public
* **Status Codes**: `200 OK` (Payment validated and successful), `400 Bad Request` (Invalid checksum or signature mismatch).
