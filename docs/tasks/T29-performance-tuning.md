# Task T29: Tối ưu hiệu suất & Load Test

## 1. Mục tiêu
- Đảm bảo hệ thống chịu tải 1000 concurrent users.

## 2. Phạm vi công việc
- [ ] Cài đặt Apache JMeter.
- [ ] Viết Test Plan: đăng nhập -> xem sản phẩm -> tạo đơn hàng.
- [ ] Kiểm tra hiệu năng của API Gateway (Rate Limiter).
- [ ] Tối ưu hóa câu lệnh SQL (thêm Index phù hợp).
- [ ] Tối ưu hóa cấu hình Redis cache (Cache các API GET thường xuyên).
- [ ] Tối ưu hóa Kafka consumer (batch size, concurrency).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Hệ thống xử lý được 500 req/s với latency < 200ms.
- [ ] Không có lỗi timeout khi tăng tải từ từ (Ramp-up).

## 4. Ghi chú kỹ thuật
- Phân tích CPU/Memory profile để tìm bottleneck.
- Sử dụng Grafana để theo dõi trong lúc test.