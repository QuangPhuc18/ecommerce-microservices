# Task T04: Thiết lập Service Discovery (Eureka Server)

## 1. Mục tiêu
- Tạo `discovery-service` để các microservices tự động đăng ký và tìm kiếm nhau.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/discovery-service/`.
- [ ] Thêm dependency `spring-cloud-starter-netflix-eureka-server`.
- [ ] Đánh dấu class chính bằng `@EnableEurekaServer`.
- [ ] Cấu hình `application.yml`: disable self-registration.
- [ ] Chạy service lên kiểm tra tại `http://localhost:8761` (Dashboard Eureka).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Dashboard Eureka hiển thị.
- [ ] Khi start một service khác (ví dụ Auth), nó tự động xuất hiện trong danh sách `Instances currently registered`.

## 4. Ghi chú kỹ thuật
- Port mặc định: `8761`.
- Ở môi trường production, cần cấu hình Eureka thành cluster (2-3 node).