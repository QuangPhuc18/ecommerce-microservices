# Task T21: Xây dựng Luồng Sản phẩm & Tìm kiếm

## 1. Mục tiêu
- Tạo tin đăng, xem chi tiết sản phẩm, tìm kiếm & lọc.

## 2. Phạm vi công việc
- [ ] Page `/product/create` (Form đăng tin) với các field: category, title, price, description, attributes động (dựa trên category), upload ảnh.
- [ ] Page `/product/[slug]` (Chi tiết): hiển thị thông tin, ảnh, thông tin người bán, nút "Chat ngay".
- [ ] Page `/search?q=...`: hiển thị kết quả tìm kiếm dạng Grid.
- [ ] Filter sidebar: Lọc theo khoảng giá, danh mục, địa điểm.
- [ ] Gọi API `/search` từ Search Service (có phân trang).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Upload ảnh thành công lên Cloudinary (hoặc lưu tạm local) và lưu URL.
- [ ] Tìm kiếm "áo thun" trả về đúng sản phẩm.
- [ ] Click vào sản phẩm ra trang chi tiết đẹp mắt.

## 4. Ghi chú kỹ thuật
- Sử dụng React Hook Form cho form phức tạp.
- Sử dụng `useInfiniteQuery` để scroll vô hạn cho danh sách sản phẩm.