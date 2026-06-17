# Thiết kế cơ sở dữ liệu

Mỗi microservice sở hữu một database PostgreSQL riêng. Dưới đây là các database và các bảng chính.

## Auth DB (auth_db)
- `users` (id UUID, email, phone, password_hash, role ENUM, is_verified BOOLEAN, created_at)
- `refresh_tokens` (id UUID, user_id FK, token, expiry_date)

## User DB (user_db)
- `users` (giống bên Auth, nhưng có thể chỉ lưu các trường cần thiết)
- `client_profiles` (user_id FK, full_name, avatar_url, default_address_id FK)
- `user_addresses` (id UUID, user_id FK, receiver_name, phone, address, province_id, district_id, is_default)
- `user_ratings` (id UUID, reviewer_id FK, reviewed_id FK, rating INT 1-5, comment TEXT, created_at)

## Product DB (product_db)
- `categories` (id SERIAL, name, slug UNIQUE, parent_id FK)
- `category_attributes_config` (id SERIAL, category_id FK, attribute_name, input_type)
- `locations` (id SERIAL, name, parent_id FK) - danh sách tỉnh/thành
- `products` (id UUID, user_id, category_id FK, location_id FK, title, slug UNIQUE, price, description, attributes JSONB, status ENUM, created_at)
- `product_images` (id UUID, product_id FK, image_url)
- `product_favorites` (id UUID, user_id, product_id FK, created_at)
- `boost_packages` (id UUID, product_id FK, package_type ENUM, expired_at)

## Order DB (order_db)
- `orders` (id UUID, product_id, buyer_id, seller_id, total_price, status ENUM, created_at)
- `order_history` (id UUID, order_id FK, status, changed_at)
- `shipping_info` (id UUID, order_id FK, receiver_name, phone, address, province_id, district_id)

## Payment DB (payment_db)
- `transactions` (id UUID, user_id, type ENUM: DEPOSIT/WITHDRAW/HOLD/RELEASE, amount, order_id FK, created_at)
- `audit_trail` (id UUID, entity_type, entity_id, action, changed_by, changed_at)

## Chat DB (chat_db)
- `conversations` (id UUID, user_one_id, user_two_id, last_message_at)
- `conversation_participants` (conversation_id FK, user_id, last_read_message_id)
- `messages` (id UUID, conversation_id FK, sender_id, content TEXT, is_read BOOLEAN, created_at)

## Analytics DB (analytics_db) - TimescaleDB
- `system_reports` (id UUID, reporter_id, product_id, reason TEXT, status ENUM)
- `admin_logs` (id UUID, admin_id, action, target_id, timestamp)

## Lưu ý
- Tất cả các bảng đều sử dụng UUID làm khóa chính (trừ một số bảng dùng SERIAL).
- Các trường `status` là ENUM với các giá trị tùy theo nghiệp vụ (ví dụ: PENDING, ACTIVE, DELETED...).
- Trường `attributes` trong bảng `products` là JSONB để lưu động các thuộc tính theo danh mục.
- Có các ràng buộc khóa ngoại (FK) để đảm bảo toàn vẹn dữ liệu.