# Task T25: Viết Unit & Integration Tests (Backend)

## 1. Mục tiêu
- Đảm bảo chất lượng code backend.

## 2. Phạm vi công việc
- [ ] Viết Unit Test cho Service Layer (dùng Mockito).
- [ ] Viết Integration Test cho Repository (dùng @DataJpaTest + Testcontainers).
- [ ] Viết Integration Test cho Controller (dùng @WebMvcTest + MockMvc).
- [ ] Chạy test coverage (JaCoCo), đảm bảo > 70% coverage cho các service quan trọng (Order, Payment).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] `mvn clean test` chạy xanh (không có lỗi).
- [ ] File `target/site/jacoco/index.html` hiển thị coverage.

## 4. Ghi chú kỹ thuật
- Dùng Testcontainers để khởi tạo Postgres/Redis trong quá trình test.
- Mock các client bên ngoài (Feign, Kafka).