Hướng dẫn chạy Backend
Yêu cầu
- Java 21 — java -version → 21.0.10 ✅
- Maven 3.9+ — mvn --version → 3.9.16 ✅
- Docker — docker --version → 29.5.3 ✅ (Docker đang chạy)
Bước 1: Tạo file .env
# Từ thư mục gốc của project
copy infrastructure\.docker\.env.example infrastructure\.docker\.env
Nếu muốn custom port/password thì sửa file .env, nếu không thì dùng mặc định.
Bước 2: Khởi động infrastructure (Docker Compose)
Mở Terminal 1 — chạy:
cd infrastructure\docker
docker compose up -d
Lệnh này sẽ start: PostgreSQL (5432), Redis (6379), ZooKeeper (2181), Kafka (9092), Elasticsearch (9200), Kibana (5601), Prometheus (9090), Grafana (3000), Loki (3100), Jaeger (16686).
Đợi ~30–60s cho các container khởi động xong. Kiểm tra:
docker ps
Tất cả container có trạng thái Up (healthy).
Lưu ý: PostgreSQL image dùng script scripts/init-multiple-dbs.sh để tự động tạo các databases: user_db, product_db, order_db, payment_db, chat_db, notification_db, analytics_db, saga_db.
Bước 3: Build & Compile backend
Mở Terminal 2 — chạy:
cd backend
mvn clean compile -q
Nếu có lỗi, dùng mvn clean compile (bỏ -q) để xem chi tiết.
Bước 4: Khởi động các service theo thứ tự
Cần 1 terminal riêng cho mỗi service (hoặc dùng tab). Chạy từng service trong thư mục backend/.
4a. Discovery Service (Eureka) — cổng 8761
cd backend\discovery-service
mvn spring-boot:run
Kiểm tra: http://localhost:8761 — xem được Eureka Dashboard là OK.
4b. Config Server — cổng 8888
cd backend\config-server
mvn spring-boot:run
4c. Các service còn lại (thứ tự bất kỳ)
Mỗi service chạy trong 1 terminal tab riêng:
cd backend\auth-service
mvn spring-boot:run
cd backend\user-service
mvn spring-boot:run
cd backend\product-service
mvn spring-boot:run
cd backend\search-service
mvn spring-boot:run
cd backend\order-service
mvn spring-boot:run
cd backend\payment-service
mvn spring-boot:run
cd backend\chat-service
mvn spring-boot:run
cd backend\notification-service
mvn spring-boot:run
cd backend\analytics-service
mvn spring-boot:run
cd backend\saga-orchestrator
mvn spring-boot:run
4d. API Gateway (cuối cùng) — cổng 8080
cd backend\api-gateway
mvn spring-boot:run
Bước 5: Kiểm tra
URL	Mục đích
http://localhost:8761 (http://localhost:8761)	Eureka Dashboard (danh sách services đã đăng ký)
http://localhost:8080/auth/api/v1/auth/login (http://localhost:8080/auth/api/v1/auth/login)	API Gateway → Auth Service (POST)
http://localhost:9090 (http://localhost:9090)	Prometheus targets
http://localhost:3000 (http://localhost:3000)	Grafana (admin/admin123)
http://localhost:16686 (http://localhost:16686)	Jaeger tracing
Terminal tối ưu
Vì có nhiều service, cách tiết kiệm nhất dùng 1 terminal duy nhất:
# Terminal 1: Docker
cd infrastructure\docker
docker compose up -d

# Terminal 1: Discovery + Config
cd backend\discovery-service
Start-Process powershell -ArgumentList "mvn spring-boot:run"
cd ..\config-server
Start-Process powershell -ArgumentList "mvn spring-boot:run"

# Terminal 1: Các service còn lại (mỗi service 1 cửa sổ riêng)
$services = @("auth-service","user-service","product-service","order-service","payment-service","chat-service","notification-service","analytics-service","saga-orchestrator","api-gateway")
foreach ($s in $services) { Start-Process powershell -ArgumentList "cd $pwd\backend\$s; mvn spring-boot:run" }
Hoặc dùng IntelliJ IDEA — mở thư mục backend/, chạy từng service bằng nút Run (hình tam giác xanh) bên cạnh class *Application.java.
Lưu ý
- search-service cần Elasticsearch đang chạy (cổng 9200) — nếu không có, service này fail nhưng không ảnh hưởng các service khác.
- Lần đầu chạy, Flyway tự động tạo bảng từ các file .sql trong db/migration/ của từng service.
- Nếu port bị conflict, sửa trong application.yml hoặc dùng --server.port=XXXX.