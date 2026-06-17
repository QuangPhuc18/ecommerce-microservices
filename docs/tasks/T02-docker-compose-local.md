# Task T02: Cài đặt Docker Compose cho môi trường Local

## 1. Mục tiêu
- Khởi tạo các dịch vụ cơ sở dữ liệu và message broker bằng Docker để dev local.

## 2. Phạm vi công việc
- [ ] Tạo thư mục `infrastructure/docker/`.
- [ ] Tạo file `docker-compose.yml` bao gồm các service:
  - `postgres_db` (Port: 5432) - Tạo sẵn 5 databases (user_db, product_db, order_db, payment_db, chat_db).
  - `redis_cache` (Port: 6379).
  - `kafka` (Port: 9092) + `zookeeper`.
  - `elasticsearch` (Port: 9200).
  - `kibana` (Port: 5601) để kiểm tra log/search.
- [ ] Tạo file `.env` mẫu để cấu hình username/password.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Chạy `docker-compose up -d` thành công.
- [ ] Kết nối được PostgreSQL bằng DBeaver/IntelliJ.
- [ ] Kết nối được Redis bằng Redis Insight.
- [ ] Tạo topic Kafka thủ công thành công (nếu cần).

## 4. Ghi chú kỹ thuật
- Dùng image `bitnami/kafka` để dễ cấu hình.
- Dùng `postgres:16-alpine` để tiết kiệm dung lượng.
- Cấu hình healthcheck cho từng container để đảm bảo thứ tự khởi động.