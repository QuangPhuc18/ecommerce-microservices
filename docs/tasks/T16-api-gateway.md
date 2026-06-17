# Task T16: Xây dựng API Gateway (Spring Cloud Gateway)

## 1. Mục tiêu
- Làm cổng duy nhất (Entrypoint) cho tất cả request từ Frontend.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/api-gateway/`.
- [ ] Cấu hình Route cho từng service: `/api/v1/auth/** -> auth-service`, `/api/v1/products/** -> product-service`.
- [ ] Cài đặt `GlobalFilter` để kiểm tra JWT (trừ endpoints login/register).
- [ ] Cấu hình Rate Limiting dùng Redis (KeyResolver dựa trên IP hoặc user).
- [ ] Cấu hình CORS cho phép frontend.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Request không có token gọi `/api/v1/products` bị trả về 401.
- [ ] Request có token hợp lệ gọi `/api/v1/orders/me` forward đúng sang order-service.
- [ ] Gửi quá 100 requests/phút từ 1 IP -> bị chặn (HTTP 429).

## 4. Ghi chú kỹ thuật
- Dùng `spring-cloud-starter-gateway`.
- Lưu token header thành `Authorization: Bearer <jwt>`.