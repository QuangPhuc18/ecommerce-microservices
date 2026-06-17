# Task T15: Xây dựng Admin & Analytics Service

## 1. Mục tiêu
- Cung cấp dashboard cho admin và thống kê báo cáo.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/analytics-service/`.
- [ ] Entity `SystemReport` (reporter_id, product_id, reason, status).
- [ ] Entity `AdminLog` (ghi log hành động của admin).
- [ ] API `POST /api/v1/reports` (tố cáo sản phẩm).
- [ ] API `GET /api/v1/admin/statistics` (tổng user, product, order, doanh thu).
- [ ] Aggregation pipeline từ Order Service và User Service.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Admin xem được thống kê số lượng đơn hàng theo ngày.
- [ ] Tố cáo sản phẩm thành công lưu vào DB.

## 4. Ghi chú kỹ thuật
- Có thể dùng TimescaleDB để lưu metric theo thời gian hiệu quả hơn.