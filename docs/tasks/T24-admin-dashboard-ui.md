# Task T24: Xây dựng Admin Dashboard UI

## 1. Mục tiêu
- Xây dựng giao diện quản trị cho Admin.

## 2. Phạm vi công việc
- [ ] Tạo Route `admin` layout (sidebar + header).
- [ ] Page `/admin/dashboard`: Hiển thị thống kê (tổng user, sản phẩm, đơn hàng, doanh thu).
- [ ] Page `/admin/users`: Bảng danh sách user + tìm kiếm + khóa tài khoản.
- [ ] Page `/admin/products`: Bảng danh sách sản phẩm + duyệt/ẩn sản phẩm.
- [ ] Page `/admin/orders`: Bảng danh sách đơn hàng + cập nhật trạng thái đơn.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Chỉ user có role ADMIN mới truy cập được (Middleware check).
- [ ] Xóa/Khóa user thành công.

## 4. Ghi chú kỹ thuật
- Sử dụng Data Table (Shadcn/ui) để hiển thị danh sách.
- Dùng `useMutation` của TanStack Query cho các action (delete, update).