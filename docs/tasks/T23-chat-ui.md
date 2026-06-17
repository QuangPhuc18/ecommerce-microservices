# Task T23: Xây dựng Giao diện Chat

## 1. Mục tiêu
- Hiển thị hội thoại và gửi/nhận tin nhắn realtime.

## 2. Phạm vi công việc
- [ ] Page `/chat`: Danh sách các cuộc hội thoại (bên trái).
- [ ] Page `/chat/[conversationId]`: Khung chat (bên phải) hiển thị tin nhắn.
- [ ] Kết nối WebSocket (Socket.io-client hoặc SockJS).
- [ ] Gửi tin nhắn: Input + nút Send.
- [ ] Đánh dấu tin nhắn đã đọc.
- [ ] Hiển thị thông báo khi có tin nhắn mới (toast notification).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Hai cửa sổ chat khác nhau gửi tin cho nhau thấy ngay lập tức.
- [ ] Refresh trang vẫn giữ được lịch sử chat.

## 4. Ghi chú kỹ thuật
- Khi kết nối WS, truyền token vào query string để xác thực.
- Sử dụng Zustand để lưu danh sách tin nhắn tạm thời.