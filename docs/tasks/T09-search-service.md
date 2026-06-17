# Task T09: Xây dựng Search Service (Elasticsearch)

## 1. Mục tiêu
- Đồng bộ dữ liệu sản phẩm vào Elasticsearch và cung cấp API tìm kiếm full-text.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/search-service/`.
- [ ] Tạo Document `ProductDocument` (index `products` trong ES).
- [ ] Consumer Kafka nhận `ProductCreatedEvent` và `ProductUpdatedEvent` -> Index vào ES.
- [ ] API `GET /api/v1/search?q=...&category=...&priceMin=...` (Sử dụng Elasticsearch Java Client).
- [ ] Cấu hình Analyzer tiếng Việt (icu_analyzer) để tìm kiếm chính xác.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Khi tạo sản phẩm mới, dữ liệu tự động xuất hiện trong ES.
- [ ] Gọi API search với từ khóa "điện thoại" trả về đúng sản phẩm.

## 4. Ghi chú kỹ thuật
- Dùng Elasticsearch Rest High Level Client hoặc Spring Data Elasticsearch.
- Cần đánh index cho `attributes` nếu cần lọc (nested object).