# Backend Microservices

Dự án bao gồm các microservice sau, mỗi service là một module Spring Boot riêng biệt.

## Danh sách service
| Service | Port | Mô tả |
|---------|------|-------|
| **Auth Service** | 8001 | Xác thực, cấp JWT, quản lý refresh token, OAuth2. |
| **User Service** | 8002 | Quản lý hồ sơ người dùng, địa chỉ, đánh giá. |
| **Product Service** | 8003 | CRUD sản phẩm, danh mục, hình ảnh, gói đẩy tin. |
| **Search Service** | 8004 | Tìm kiếm sản phẩm bằng Elasticsearch, gợi ý từ khóa. |
| **Order Service** | 8005 | Quản lý đơn hàng, lịch sử trạng thái, thông tin vận chuyển. |
| **Payment Service** | 8006 | Xử lý thanh toán (VNPay/Momo), quản lý ví, giao dịch. |
| **Chat Service** | 8007 | Chat realtime qua WebSocket, lưu tin nhắn. |
| **Notification Service** | 8008 | Gửi email, SMS, push notification. |
| **Analytics Service** | 8009 | Thống kê, báo cáo, dashboard admin. |
| **Saga Orchestrator** | 8010 | Điều phối distributed transaction (Saga pattern). |
| **Admin Service** | 8011 | Quản lý admin, banner, cấu hình hệ thống. |

Ngoài ra còn có các service hạ tầng:
- **Discovery Service** (Eureka) – cổng 8761.
- **Config Server** – cổng 8888.
- **API Gateway** – cổng 8080.

## Cấu trúc thư mục chi tiết (Monorepo)
backend/
│
├── auth-service/ # Xác thực & Phân quyền (JWT, OAuth2)
│ ├── src/main/java/com/c2c/auth/
│ │ ├── controller/
│ │ │ ├── AuthController.java
│ │ │ └── TokenController.java
│ │ ├── service/
│ │ │ ├── AuthService.java
│ │ │ ├── JwtService.java
│ │ │ └── OAuth2Service.java
│ │ ├── repository/
│ │ │ ├── UserRepository.java
│ │ │ └── RefreshTokenRepository.java
│ │ ├── model/
│ │ │ ├── User.java
│ │ │ └── RefreshToken.java
│ │ ├── dto/
│ │ │ ├── request/
│ │ │ │ ├── LoginRequest.java
│ │ │ │ └── RegisterRequest.java
│ │ │ └── response/
│ │ │ ├── AuthResponse.java
│ │ │ └── TokenResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ ├── JwtConfig.java
│ │ │ └── RedisConfig.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ └── UserEventProducer.java
│ │ │ └── consumer/
│ │ │ └── AuthEventConsumer.java
│ │ ├── exception/
│ │ │ ├── GlobalExceptionHandler.java
│ │ │ └── CustomExceptions.java
│ │ └── util/
│ │ ├── PasswordEncoder.java
│ │ └── TokenGenerator.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ ├── application-dev.yml
│ │ ├── application-prod.yml
│ │ └── db/migration/
│ │ ├── V1__create_users_table.sql
│ │ └── V2__create_refresh_tokens_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── user-service/ # Quản lý hồ sơ, địa chỉ, đánh giá
│ ├── src/main/java/com/c2c/user/
│ │ ├── controller/
│ │ │ ├── UserController.java
│ │ │ ├── ProfileController.java
│ │ │ └── AddressController.java
│ │ ├── service/
│ │ │ ├── UserService.java
│ │ │ ├── ProfileService.java
│ │ │ └── AddressService.java
│ │ ├── repository/
│ │ │ ├── UserRepository.java
│ │ │ ├── ProfileRepository.java
│ │ │ └── AddressRepository.java
│ │ ├── model/
│ │ │ ├── User.java
│ │ │ ├── ClientProfile.java
│ │ │ └── UserAddress.java
│ │ ├── dto/
│ │ │ ├── UserProfileDTO.java
│ │ │ └── AddressDTO.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ └── FeignConfig.java
│ │ ├── messaging/
│ │ │ └── consumer/
│ │ │ └── UserEventConsumer.java
│ │ ├── exception/
│ │ │ └── GlobalExceptionHandler.java
│ │ └── client/
│ │ ├── ProductServiceClient.java
│ │ └── OrderServiceClient.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_users_table.sql
│ │ ├── V2__create_client_profiles_table.sql
│ │ ├── V3__create_user_addresses_table.sql
│ │ └── V4__create_user_ratings_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── product-service/ # Quản lý sản phẩm, danh mục, hình ảnh, yêu thích, gói đẩy tin
│ ├── src/main/java/com/c2c/product/
│ │ ├── controller/
│ │ │ ├── ProductController.java
│ │ │ ├── CategoryController.java
│ │ │ ├── ImageController.java
│ │ │ └── FavoriteController.java
│ │ ├── service/
│ │ │ ├── ProductService.java
│ │ │ ├── CategoryService.java
│ │ │ ├── ImageService.java
│ │ │ ├── FavoriteService.java
│ │ │ └── BoostService.java
│ │ ├── repository/
│ │ │ ├── ProductRepository.java
│ │ │ ├── CategoryRepository.java
│ │ │ ├── ImageRepository.java
│ │ │ └── FavoriteRepository.java
│ │ ├── model/
│ │ │ ├── Product.java
│ │ │ ├── Category.java
│ │ │ ├── ProductImage.java
│ │ │ ├── ProductFavorite.java
│ │ │ └── BoostPackage.java
│ │ ├── dto/
│ │ │ ├── request/
│ │ │ │ ├── ProductCreateRequest.java
│ │ │ │ └── ProductUpdateRequest.java
│ │ │ └── response/
│ │ │ ├── ProductResponse.java
│ │ │ └── ProductListResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ ├── ElasticsearchConfig.java
│ │ │ └── RedisConfig.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ ├── ProductEventProducer.java
│ │ │ │ └── SearchIndexProducer.java
│ │ │ └── consumer/
│ │ │ └── ProductEventConsumer.java
│ │ ├── exception/
│ │ │ └── GlobalExceptionHandler.java
│ │ └── util/
│ │ ├── SlugGenerator.java
│ │ └── ProductValidator.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_categories_table.sql
│ │ ├── V2__create_products_table.sql
│ │ ├── V3__create_product_images_table.sql
│ │ ├── V4__create_product_favorites_table.sql
│ │ └── V5__create_boost_packages_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── search-service/ # Tìm kiếm Elasticsearch (full-text, gợi ý, lọc)
│ ├── src/main/java/com/c2c/search/
│ │ ├── controller/
│ │ │ ├── SearchController.java
│ │ │ └── SuggestionController.java
│ │ ├── service/
│ │ │ ├── SearchService.java
│ │ │ ├── IndexService.java
│ │ │ └── SuggestionService.java
│ │ ├── repository/
│ │ │ └── ProductElasticsearchRepository.java
│ │ ├── model/
│ │ │ └── ProductDocument.java
│ │ ├── dto/
│ │ │ ├── SearchRequest.java
│ │ │ └── SearchResponse.java
│ │ ├── config/
│ │ │ ├── ElasticsearchConfig.java
│ │ │ └── SecurityConfig.java
│ │ ├── messaging/
│ │ │ └── consumer/
│ │ │ └── SearchIndexConsumer.java
│ │ └── exception/
│ │ └── GlobalExceptionHandler.java
│ ├── src/main/resources/
│ │ └── application.yml
│ ├── Dockerfile
│ └── pom.xml
│
├── order-service/ # Quản lý đơn hàng, lịch sử, vận chuyển
│ ├── src/main/java/com/c2c/order/
│ │ ├── controller/
│ │ │ ├── OrderController.java
│ │ │ └── ShippingController.java
│ │ ├── service/
│ │ │ ├── OrderService.java
│ │ │ ├── OrderHistoryService.java
│ │ │ └── ShippingService.java
│ │ ├── repository/
│ │ │ ├── OrderRepository.java
│ │ │ ├── OrderHistoryRepository.java
│ │ │ └── ShippingRepository.java
│ │ ├── model/
│ │ │ ├── Order.java
│ │ │ ├── OrderHistory.java
│ │ │ └── ShippingInfo.java
│ │ ├── dto/
│ │ │ ├── request/
│ │ │ │ └── OrderCreateRequest.java
│ │ │ └── response/
│ │ │ └── OrderResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ └── SagaConfig.java
│ │ ├── saga/
│ │ │ ├── OrderSagaOrchestrator.java
│ │ │ ├── OrderSagaStep.java
│ │ │ └── compensation/
│ │ │ ├── InventoryCompensation.java
│ │ │ └── PaymentCompensation.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ └── OrderEventProducer.java
│ │ │ └── consumer/
│ │ │ └── OrderEventConsumer.java
│ │ ├── client/
│ │ │ ├── ProductServiceClient.java
│ │ │ ├── PaymentServiceClient.java
│ │ │ └── NotificationServiceClient.java
│ │ └── exception/
│ │ └── GlobalExceptionHandler.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_orders_table.sql
│ │ ├── V2__create_order_history_table.sql
│ │ └── V3__create_shipping_info_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── payment-service/ # Thanh toán, ví, giao dịch, audit
│ ├── src/main/java/com/c2c/payment/
│ │ ├── controller/
│ │ │ ├── PaymentController.java
│ │ │ ├── TransactionController.java
│ │ │ └── WalletController.java
│ │ ├── service/
│ │ │ ├── PaymentService.java
│ │ │ ├── TransactionService.java
│ │ │ ├── WalletService.java
│ │ │ └── VNPayService.java
│ │ ├── repository/
│ │ │ ├── TransactionRepository.java
│ │ │ └── AuditTrailRepository.java
│ │ ├── model/
│ │ │ ├── Transaction.java
│ │ │ └── AuditTrail.java
│ │ ├── dto/
│ │ │ ├── PaymentRequest.java
│ │ │ └── PaymentResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ └── VNPayConfig.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ └── PaymentEventProducer.java
│ │ │ └── consumer/
│ │ │ └── PaymentEventConsumer.java
│ │ ├── exception/
│ │ │ └── GlobalExceptionHandler.java
│ │ └── util/
│ │ └── PaymentValidator.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_transactions_table.sql
│ │ └── V2__create_audit_trail_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── chat-service/ # Chat realtime (WebSocket, Redis Pub/Sub)
│ ├── src/main/java/com/c2c/chat/
│ │ ├── controller/
│ │ │ ├── ConversationController.java
│ │ │ └── MessageController.java
│ │ ├── service/
│ │ │ ├── ConversationService.java
│ │ │ ├── MessageService.java
│ │ │ └── WebSocketService.java
│ │ ├── repository/
│ │ │ ├── ConversationRepository.java
│ │ │ ├── MessageRepository.java
│ │ │ └── ParticipantRepository.java
│ │ ├── model/
│ │ │ ├── Conversation.java
│ │ │ ├── Message.java
│ │ │ └── ConversationParticipant.java
│ │ ├── dto/
│ │ │ ├── MessageRequest.java
│ │ │ └── MessageResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ ├── WebSocketConfig.java
│ │ │ └── RedisConfig.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ └── ChatEventProducer.java
│ │ │ └── consumer/
│ │ │ └── ChatEventConsumer.java
│ │ └── exception/
│ │ └── GlobalExceptionHandler.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_conversations_table.sql
│ │ ├── V2__create_conversation_participants_table.sql
│ │ └── V3__create_messages_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── notification-service/ # Gửi thông báo (email, SMS, push)
│ ├── src/main/java/com/c2c/notification/
│ │ ├── controller/
│ │ │ └── NotificationController.java
│ │ ├── service/
│ │ │ ├── NotificationService.java
│ │ │ ├── EmailService.java
│ │ │ ├── SmsService.java
│ │ │ └── PushNotificationService.java
│ │ ├── repository/
│ │ │ └── NotificationRepository.java
│ │ ├── model/
│ │ │ └── Notification.java
│ │ ├── dto/
│ │ │ ├── NotificationRequest.java
│ │ │ └── NotificationResponse.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ ├── EmailConfig.java
│ │ │ └── FirebaseConfig.java
│ │ ├── messaging/
│ │ │ └── consumer/
│ │ │ └── NotificationConsumer.java
│ │ └── exception/
│ │ └── GlobalExceptionHandler.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ └── V1__create_notifications_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── analytics-service/ # Phân tích, báo cáo, log admin
│ ├── src/main/java/com/c2c/analytics/
│ │ ├── controller/
│ │ │ ├── DashboardController.java
│ │ │ └── ReportController.java
│ │ ├── service/
│ │ │ ├── AnalyticsService.java
│ │ │ ├── ReportService.java
│ │ │ └── SystemReportService.java
│ │ ├── repository/
│ │ │ ├── SystemReportRepository.java
│ │ │ └── AdminLogRepository.java
│ │ ├── model/
│ │ │ ├── SystemReport.java
│ │ │ └── AdminLog.java
│ │ ├── dto/
│ │ │ ├── ReportRequest.java
│ │ │ └── DashboardData.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ └── TimescaleDBConfig.java
│ │ ├── messaging/
│ │ │ └── consumer/
│ │ │ └── AnalyticsConsumer.java
│ │ └── exception/
│ │ └── GlobalExceptionHandler.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── db/migration/
│ │ ├── V1__create_system_reports_table.sql
│ │ └── V2__create_admin_logs_table.sql
│ ├── Dockerfile
│ └── pom.xml
│
├── saga-orchestrator/ # Điều phối giao dịch phân tán (Saga)
│ ├── src/main/java/com/c2c/saga/
│ │ ├── orchestrator/
│ │ │ ├── SagaOrchestrator.java
│ │ │ ├── OrderSagaOrchestrator.java
│ │ │ └── SagaStep.java
│ │ ├── step/
│ │ │ ├── ValidateProductStep.java
│ │ │ ├── ReserveInventoryStep.java
│ │ │ ├── ProcessPaymentStep.java
│ │ │ ├── CreateOrderStep.java
│ │ │ └── SendNotificationStep.java
│ │ ├── compensation/
│ │ │ ├── CompensationHandler.java
│ │ │ └── CompensationRegistry.java
│ │ ├── state/
│ │ │ ├── SagaState.java
│ │ │ └── SagaStateMachine.java
│ │ ├── config/
│ │ │ ├── SecurityConfig.java
│ │ │ └── KafkaConfig.java
│ │ ├── messaging/
│ │ │ ├── producer/
│ │ │ │ └── SagaEventProducer.java
│ │ │ └── consumer/
│ │ │ └── SagaEventConsumer.java
│ │ └── exception/
│ │ └── SagaException.java
│ ├── src/main/resources/
│ │ └── application.yml
│ ├── Dockerfile
│ └── pom.xml
│
├── api-gateway/ # Spring Cloud Gateway – cổng duy nhất
│ ├── src/main/java/com/c2c/gateway/
│ │ ├── config/
│ │ │ ├── GatewayConfig.java
│ │ │ ├── SecurityConfig.java
│ │ │ ├── RateLimiterConfig.java
│ │ │ └── CorsConfig.java
│ │ ├── filter/
│ │ │ ├── AuthenticationFilter.java
│ │ │ ├── LoggingFilter.java
│ │ │ └── RateLimiterFilter.java
│ │ ├── exception/
│ │ │ └── GlobalExceptionHandler.java
│ │ └── util/
│ │ └── JwtUtil.java
│ ├── src/main/resources/
│ │ └── application.yml
│ ├── Dockerfile
│ └── pom.xml
│
├── discovery-service/ # Service Registry (Netflix Eureka)
│ ├── src/main/java/com/c2c/discovery/
│ │ └── DiscoveryApplication.java
│ ├── src/main/resources/
│ │ └── application.yml
│ ├── Dockerfile
│ └── pom.xml
│
├── config-server/ # Cấu hình tập trung (Spring Cloud Config)
│ ├── src/main/java/com/c2c/config/
│ │ └── ConfigServerApplication.java
│ ├── src/main/resources/
│ │ ├── application.yml
│ │ └── config-repo/
│ │ ├── auth-service.yml
│ │ ├── user-service.yml
│ │ ├── product-service.yml
│ │ └── ... (các file cấu hình khác)
│ ├── Dockerfile
│ └── pom.xml
│
├── shared-lib/ # Thư viện dùng chung (DTO, Event, Exception, Util)
│ ├── src/main/java/com/c2c/shared/
│ │ ├── dto/
│ │ │ ├── UserDTO.java
│ │ │ ├── ProductDTO.java
│ │ │ ├── OrderDTO.java
│ │ │ └── PaymentDTO.java
│ │ ├── event/
│ │ │ ├── OrderEvent.java
│ │ │ ├── PaymentEvent.java
│ │ │ └── NotificationEvent.java
│ │ ├── exception/
│ │ │ ├── BusinessException.java
│ │ │ └── ErrorCode.java
│ │ ├── util/
│ │ │ ├── JsonUtils.java
│ │ │ └── DateUtils.java
│ │ └── constant/
│ │ ├── ServiceConstants.java
│ │ └── MessageConstants.java
│ ├── pom.xml
│ └── README.md
│
└── pom.xml # Parent POM quản lý dependency toàn bộ backend


## Ghi chú bổ sung
- Mỗi service có thể có thêm các package riêng như `validation`, `interceptor`, `aspect` tùy nghiệp vụ.
- Tất cả các service đều sử dụng **Spring Cloud** để tích hợp Eureka, Config, Gateway.
- Các file migration Flyway được đặt trong `src/main/resources/db/migration/` và tuân theo quy tắc đặt tên `V{version}__{description}.sql`.
- File `application.yml` trong mỗi service có thể được ghi đè bởi Config Server ở môi trường production.
- `shared-lib` được build thành `.jar` và đưa vào classpath của các service thông qua dependency trong `pom.xml`.

## Tài liệu liên quan
- [Tổng quan kiến trúc](01-overview.md)
- [Cơ chế giao tiếp](05-communication.md)
- [Thiết kế database](04-database-design.md)