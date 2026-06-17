# Task T05: Thiết lập Config Server (Spring Cloud Config)

## 1. Mục tiêu
- Tạo `config-server` để quản lý tập trung file cấu hình (application.yml) cho tất cả service.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/config-server/`.
- [ ] Thêm dependency `spring-cloud-config-server`.
- [ ] Đánh dấu class chính bằng `@EnableConfigServer`.
- [ ] Tạo thư mục `src/main/resources/config-repo/` (hoặc kết nối Git repo riêng).
- [ ] Tạo file `auth-service.yml`, `product-service.yml`, `order-service.yml`... bên trong.
- [ ] Cấu hình các service còn lại gọi đến Config Server để lấy cấu hình thay vì đọc local.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Config Server start thành công.
- [ ] Gọi GET `http://localhost:8888/auth-service/default` trả về nội dung cấu hình.
- [ ] Service mới không cần khai báo DB URL cứng nữa, chỉ cần chỉ tên service.

## 4. Ghi chú kỹ thuật
- Kết hợp với Spring Cloud Bus để refresh config nóng không cần restart service (tùy chọn).