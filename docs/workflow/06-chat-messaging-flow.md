# 06 — Chat & Messaging Flow

## Tổng quan

Nhắn tin realtime giữa người mua và người bán qua WebSocket STOMP + REST API.

**Services tham gia:**
- `api-gateway` (port 8080) — routing, JWT, WebSocket proxy
- `chat-service` (port 8007) — business logic, WebSocket server

**Database:** `chat_db` PostgreSQL — `conversations`, `conversation_participants`, `messages`
**Cache:** Redis — unread count
**WebSocket:** STOMP over SockJS tại `/ws`
**Kafka topic:** `chat.message.sent`

---

## 1. Kiến trúc Realtime

```mermaid
sequenceDiagram
    participant Sender as Buyer Browser
    participant Gateway as API Gateway
    participant ChatSvc as chat-service (8007)
    participant DB as chat_db
    participant Redis
    participant Recipient as Seller Browser

    Note over Sender,Recipient: WebSocket handshake
    Sender->>Gateway: CONNECT /ws (SockJS)
    Gateway->>ChatSvc: Upgrade to WebSocket
    ChatSvc-->>Sender: STOMP CONNECTED

    Recipient->>Gateway: CONNECT /ws
    Gateway->>ChatSvc: Upgrade
    ChatSvc-->>Recipient: STOMP CONNECTED

    Note over Sender,Recipient: Send message
    Sender->>Gateway: SEND /app/chat.send (JSON message)
    Gateway->>ChatSvc: Forward STOMP frame

    ChatSvc->>ChatSvc: MessageService.sendMessage()
    ChatSvc->>DB: INSERT messages
    ChatSvc->>DB: UPDATE conversations (lastMessage, lastMessageAt)
    ChatSvc->>Redis: Increment unread count

    ChatSvc->>Recipient: MESSAGE /topic/conversations/{convId} (real-time push)
    ChatSvc-->>Sender: MESSAGE /queue/reply (confirmation)
```

### WebSocket Endpoints

| Endpoint | Mô tả |
|----------|-------|
| `GET /ws` | SockJS WebSocket endpoint (public) |
| `/app/chat.send` | Client → Server: gửi tin nhắn |
| `/topic/conversations/{convId}` | Server → Client: nhận tin nhắn realtime |
| `/user/queue/reply` | Server → Client: confirmation |

### STOMP Message Flow

```
Client → SEND /app/chat.send
  Header: content-type: application/json
  Body: { conversationId, content, clientGeneratedId }

Server → MESSAGE /topic/conversations/{convId}
  Body: MessageResponse (id, senderId, content, createdAt, clientGeneratedId)

Server → MESSAGE /user/queue/reply (to sender only)
  Body: { status: "sent", messageId, clientGeneratedId }
```

---

## 2. REST API — Hội thoại

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant ChatSvc as chat-service
    participant DB

    Note over User: POST /api/v1/chats/conversations
    User->>Gateway: { recipientId, listingId, listingTitle, initialMessage? }
    ChatSvc->>DB: Tạo Conversation
    ChatSvc->>DB: Tạo ConversationParticipants (2 users)
    alt Có initialMessage
        ChatSvc->>DB: Tạo Message đầu tiên
    end
    ChatSvc-->>User: ConversationResponse

    Note over User: GET /api/v1/chats/conversations
    ChatSvc->>DB: Join conversations + participants
    ChatSvc->>DB: findByUserId(userId) ORDER BY lastMessageAt DESC
    ChatSvc->>Redis: Get unread count for each
    ChatSvc-->>User: List<ConversationResponse>

    Note over User: GET /api/v1/chats/messages/{convId}
    ChatSvc->>ChatSvc: Check user is participant
    ChatSvc->>DB: findByConversationIdOrderByCreatedAtAsc
    DB-->>ChatSvc: Page<Message>
    ChatSvc-->>User: Paginated messages
```

### Conversation Response

```json
{
  "id": "uuid",
  "listingId": 1,
  "listingTitle": "iPhone 14 Pro Max",
  "lastMessage": "Còn hàng không bạn?",
  "lastMessageAt": "2026-07-03T08:30:00",
  "unreadCount": 3,
  "otherUserId": "seller-uuid",
  "otherUserName": "Nguyen Van B"
}
```

---

## 3. Mark as Read

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant ChatSvc as chat-service
    participant DB
    participant Redis

    User->>Gateway: POST /api/v1/chats/messages/{convId}/read
    Gateway->>ChatSvc: Forward

    ChatSvc->>DB: UPDATE messages SET is_read = true
    Note over ChatSvc: WHERE conversationId = convId AND senderId != userId AND isRead = false

    ChatSvc->>DB: UPDATE conversation_participants SET lastReadAt = now()
    ChatSvc->>Redis: Reset unread count (set 0)
    ChatSvc-->>User: 200 { success: true }
```

---

## 4. Participants & Access Control

```mermaid
flowchart TD
    A[User sends message] --> B{Is user participant?}
    B -->|Yes| C[Save message]
    B -->|No| D[Throw FORBIDDEN]

    E[User lists messages] --> F{Is user participant?}
    F -->|Yes| G[Return messages]
    F -->|No| H[Throw FORBIDDEN]
```

### Conversation Participants Table

| Column | Type | Ghi chú |
|--------|------|---------|
| conversation_id | UUID (FK) | |
| user_id | UUID | |
| last_read_at | TIMESTAMP | |
| last_read_message_id | UUID | |

Unique constraint: `(conversation_id, user_id)`

---

## 5. Event Flow

```mermaid
flowchart LR
    subgraph chat-service
        C[ChatEventProducer] -->|publish| E(chat.message.sent)
    end
    subgraph Kafka
        E
    end
```

**Payload `chat.message.sent`:**
```json
{
  "messageId": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "recipientId": "uuid",
  "content": "Còn hàng không bạn?",
  "messageType": "TEXT",
  "createdAt": "2026-07-03T08:30:00"
}
```

---

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| WebSocket disconnect | Tin nhắn vẫn lưu DB, đồng bộ khi reconnect |
| Người gửi không phải participant | 403 FORBIDDEN |
| Conversation không tồn tại | 404 NOT_FOUND |
| Tin nhắn rỗng | 400 VALIDATION_ERROR |
| Redis unavailable | Unread count fallback về DB query |
