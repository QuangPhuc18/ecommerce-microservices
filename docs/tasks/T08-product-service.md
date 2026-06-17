# Task T08: Xây dựng Product Service (Sản phẩm & Danh mục)

## 1. Mục tiêu
- Quản lý danh mục, sản phẩm, hình ảnh, đánh dấu yêu thích.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/product-service/`.
- [ ] Entity `Category` (đa cấp parent_id).
- [ ] Entity `Product` (title, slug, price, description, attributes JSONB, location_id, status ENUM).
- [ ] Entity `ProductImage`, `ProductFavorite`, `BoostPackage`.
- [ ] API `POST /api/v1/products` (tạo sản phẩm).
- [ ] API `GET /api/v1/products/{slug}` (chi tiết).
- [ ] API `GET /api/v1/categories` (lấy danh sách cây thư mục).
- [ ] Producer Kafka: Gửi `ProductCreatedEvent` sang Search Service và Analytics Service.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Tạo sản phẩm thành công, dữ liệu JSONB lưu đúng (VD: ram: "8GB", screen: "6.5 inch").
- [ ] Slug được tự động sinh từ title (không dấu, gạch nối).

## 4. Ghi chú kỹ thuật
- Dùng Hibernate `@Type(JsonType.class)` để map JSONB.
- Tạo unique constraint cho `slug`.