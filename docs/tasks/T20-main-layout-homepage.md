# Task T20: Xây dựng Layout chính & Trang chủ

## 1. Mục tiêu
- Xây dựng giao diện Header, Footer và hiển thị danh mục sản phẩm.

## 2. Phạm vi công việc
- [ ] Tạo `(main)/layout.tsx` bao gồm Header (Logo, Search bar, Avatar/Cart).
- [ ] Tạo Footer với các liên kết điều hướng.
- [ ] Tạo Page `(main)/page.tsx` (Homepage):
  - Component `CategoryList` hiển thị danh mục cấp 1.
  - Component `ProductGrid` hiển thị sản phẩm nổi bật (gọi API product-service).
  - Banner slider quảng cáo.
- [ ] Gọi API để lấy danh mục và sản phẩm (Server Component).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Giao diện giống các trang C2C, có ô tìm kiếm ở Header.
- [ ] Danh mục hiển thị đúng (VD: Điện thoại, Xe cộ, Bất động sản).

## 4. Ghi chú kỹ thuật
- Sử dụng `fetch` trong Server Component để tối ưu SEO.
- Ảnh sử dụng `next/image` để tối ưu tải trang.