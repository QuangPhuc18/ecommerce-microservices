# Task T07: Xây dựng User Service (Profile & Address)

## 1. Mục tiêu
- Quản lý thông tin người dùng, địa chỉ, đánh giá.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/user-service/`.
- [ ] Entity `ClientProfile` (user_id, full_name, avatar_url).
- [ ] Entity `UserAddress` (receiver_name, phone, address, province_id, district_id, is_default).
- [ ] Entity `UserRating` (reviewer_id, reviewed_id, rating 1-5, comment).
- [ ] API lấy thông tin profile: `GET /api/v1/users/me`.
- [ ] API cập nhật profile: `PUT /api/v1/users/me`.
- [ ] API CRUD địa chỉ: `GET/POST/PUT/DELETE /api/v1/users/addresses`.
- [ ] Consumer Kafka nhận `UserCreatedEvent` để tự động tạo profile mặc định.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Người dùng mới đăng ký tự động có profile trong DB.
- [ ] API lấy address trả về đúng dữ liệu.

## 4. Ghi chú kỹ thuật
- Sử dụng OpenFeign để gọi xuống `location-service` (nếu cần) để lấy tên Tỉnh/Thành phố.