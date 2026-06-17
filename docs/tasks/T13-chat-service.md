# Task T13: Xây dựng Chat Service (Realtime)

## 1. Mục tiêu
- Cho phép người mua và người bán trò chuyện trực tiếp.

## 2. Phạm vi công việc
- [ ] Tạo module `backend/chat-service/`.
- [ ] Entity `Conversation`, `ConversationParticipant`, `Message`.
- [ ] Cấu hình WebSocket (STOMP) với Spring.
- [ ] Redis dùng làm Message Broker cho WebSocket (để scale ngang).
- [ ] API `POST /api/v1/chats/messages` (gửi tin nhắn).
- [ ] Đánh dấu đã đọc (is_read) và cập nhật `last_read_message_id`.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Hai người dùng có thể chat với nhau trong thời gian thực.
- [ ] Lịch sử tin nhắn lưu vào DB.

## 4. Ghi chú kỹ thuật
- Cần cấu hình CORS cho WebSocket.
- Dùng STOMP over SockJS để fallback nếu browser không hỗ trợ WebSocket.