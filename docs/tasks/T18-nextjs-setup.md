# Task T18: Thiết lập dự án Frontend (Next.js)

## 1. Mục tiêu
- Khởi tạo ứng dụng Next.js 14 với các công cụ cần thiết.

## 2. Phạm vi công việc
- [ ] Tạo ứng dụng Next.js trong `frontend/apps/web`.
- [ ] Cài đặt Tailwind CSS và Shadcn/ui (cài button, card, dialog).
- [ ] Cài đặt Zustand và TanStack Query (@tanstack/react-query).
- [ ] Cấu hình Axios instance (`lib/api/axios.ts`) với base URL trỏ đến API Gateway.
- [ ] Cấu hình middleware.ts để bảo vệ route (/admin, /profile).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Chạy `npm run dev` thành công.
- [ ] Truy cập http://localhost:3000 thấy trang mặc định.
- [ ] File `middleware.ts` có logic kiểm tra token.

## 4. Ghi chú kỹ thuật
- Dùng `next@14.0.4` với App Router.
- Cấu hình `baseUrl` trong tsconfig để import ngắn gọn (`@/components`, `@/lib`).