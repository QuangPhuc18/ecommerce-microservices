# Bảo mật (Security)

## Xác thực (Authentication)
- Sử dụng **JWT** (JSON Web Token) với thuật toán **RSA256** (cặp khóa công khai/riêng tư).
- Token được cấp bởi **Auth Service** sau khi người dùng đăng nhập.
- Refresh token được lưu trong database (Auth DB) để cấp lại access token khi hết hạn.
- Hỗ trợ OAuth2 (Google, Facebook) – có thể tích hợp sau.

## Phân quyền (Authorization)
- Sử dụng **Spring Security** với các vai trò (roles):
  - `ROLE_USER`: người dùng thông thường.
  - `ROLE_SELLER`: người bán (có thể đăng sản phẩm).
  - `ROLE_ADMIN`: quản trị viên (truy cập admin dashboard).
- Các endpoint được bảo vệ bằng `@PreAuthorize` dựa trên role.

## Bảo mật dữ liệu
- Mật khẩu được mã hóa bằng **BCrypt**.
- Kết nối giữa các service sử dụng **mTLS** (nếu cần).
- Sử dụng **HTTPS** cho tất cả các giao tiếp bên ngoài (thông qua Ingress và SSL certificate).

## Quản lý bí mật (Secrets)
- Các thông tin nhạy cảm (DB password, API key VNPay, JWT private key) không được lưu trong code.
- Sử dụng **HashiCorp Vault** (hoặc Kubernetes Secrets) để lưu trữ và cấp phát bí mật.
- Config Server có thể tích hợp Vault để lấy secrets động.

## Bảo vệ chống tấn công
- **Rate Limiting** tại API Gateway (Redis-based) để chống DDoS.
- **CORS** chỉ cho phép các domain được cấu hình.
- **SQL Injection** phòng tránh bằng JPA/Hibernate (PreparedStatement).
- **XSS** được ngăn chặn bằng các framework (React tự động escape).
- **CSRF** được bảo vệ bằng token (Spring Security có cơ chế này, nhưng với REST API stateless thì có thể tắt).
- Audit log ghi lại mọi thay đổi quan trọng (xem bảng `audit_trail`).