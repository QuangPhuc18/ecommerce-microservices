# Task T03: Xây dựng Shared Library (common-lib)

## 1. Mục tiêu
- Tạo module `shared-lib` chứa code dùng chung để tránh lặp code giữa các service.

## 2. Phạm vi công việc
- [ ] Tạo thư mục `backend/shared-lib/` và file `pom.xml` riêng (đóng gói thành `.jar`).
- [ ] Tạo package `com.c2c.shared.dto`: Chứa UserDTO, ProductDTO, OrderDTO, PaymentDTO.
- [ ] Tạo package `com.c2c.shared.event`: Chứa các Event class (OrderCreatedEvent, PaymentProcessedEvent...).
- [ ] Tạo package `com.c2c.shared.exception`: Chứa `BusinessException`, `ErrorCode` enum.
- [ ] Tạo package `com.c2c.shared.util`: Chứa `JsonUtils`, `DateUtils`, `Constants`.
- [ ] Cài đặt dependency Lombok và MapStruct để mapping DTO.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Build `shared-lib` ra file `.jar` thành công (`mvn clean install`).
- [ ] Các service khác có thể khai báo dependency này trong `pom.xml`.

## 4. Ghi chú kỹ thuật
- Đảm bảo các DTO implement `Serializable`.
- Sử dụng MapStruct để chuyển đổi Entity <-> DTO trong các service, nhưng đặt interface ở đây để dùng chung.