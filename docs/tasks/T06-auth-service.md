# Task T06: Xây dựng Auth Service (Xác thực & Phân quyền)

## 1. Mục tiêu
- Xử lý đăng nhập, đăng ký, cấp JWT.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/auth-service/` với cấu trúc MVC.
- [ ] Tạo Entity `User` (id UUID, email, phone, password_hash, role ENUM).
- [ ] Tạo API `POST /api/v1/auth/register`.
- [ ] Tạo API `POST /api/v1/auth/login` (trả về JWT access token + refresh token).
- [ ] Tạo API `POST /api/v1/auth/refresh-token` để lấy token mới.
- [ ] Tích hợp Spring Security, bật BCrypt.
- [ ] Sản xuất event `UserCreatedEvent` gửi lên Kafka để User Service lưu profile.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Đăng ký user thành công, password được mã hóa BCrypt.
- [ ] Đăng nhập đúng trả về JWT hợp lệ (HS256 hoặc RSA).
- [ ] Postman gọi API `/auth/login` thành công (HTTP 200).

## 4. Ghi chú kỹ thuật
- Nếu dùng RSA, lưu Private Key trong Vault (hoặc env).
- Role: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_SELLER`.