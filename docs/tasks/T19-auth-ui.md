# Task T19: Xây dựng Giao diện Xác thực (Auth UI)

## 1. Mục tiêu
- Xây dựng trang Login, Register, Forgot Password.

## 2. Phạm vi công việc
- [ ] Tạo Route `(auth)` layout (không có header/footer, fullscreen).
- [ ] Tạo Page `/login` (form email/password).
- [ ] Tạo Page `/register` (form email, phone, password, confirm).
- [ ] Tạo Page `/forgot-password`.
- [ ] Viết `useAuth` hook gọi API `/auth/login` và lưu token vào localStorage (hoặc cookie).
- [ ] Tạo `AuthStore` (Zustand) lưu user info và token.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Đăng nhập thành công -> redirect về trang chủ.
- [ ] Lưu token và tự động thêm header `Authorization` cho các request sau.
- [ ] Form validation (email đúng định dạng, password > 6 ký tự).

## 4. Ghi chú kỹ thuật
- Dùng React Hook Form + Zod để validate form hiệu quả.
- Có thể dùng `cookies` (next/headers) để lưu HTTP-Only cookie thay vì localStorage (bảo mật hơn).