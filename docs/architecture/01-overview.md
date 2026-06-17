# Tổng quan kiến trúc

## Sơ đồ tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile Web  │  │  iOS App     │  │  Android App │      │
│  │  (Next.js)   │  │  (PWA)       │  │  (React Native)│  │  (React Native)│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                    Spring Cloud Gateway                                   │ │
│  │  • Routing • Rate Limiting • Authentication • CORS • Circuit Breaker    │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE DISCOVERY (Eureka/Nacos)                        │
│                            • Service Registry                                  │
│                            • Health Checks                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES LAYER                                   │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   User       │  │   Product    │  │   Search     │      │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │      │
│  │  (Port 8001) │  │  (Port 8002) │  │  (Port 8003) │  │  (Port 8004) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Order      │  │   Payment    │  │   Chat       │  │   Notification│     │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │      │
│  │  (Port 8005) │  │  (Port 8006) │  │  (Port 8007) │  │  (Port 8008) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                         │
│  │  Analytics   │  │   Saga       │  │   Admin      │                         │
│  │   Service    │  │ Orchestrator │  │   Service    │                         │
│  │  (Port 8009) │  │  (Port 8010) │  │  (Port 8011) │                         │
│  └──────────────┘  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────────┘
          │                           │                           │
          └───────────────┬───────────┴───────────┬───────────────┘
                          │                       │
                          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE BROKER & EVENT BUS                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                    RabbitMQ / Apache Kafka                                │ │
│  │  • Event-driven communication • Saga compensation • Async processing    │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                          │                       │
                          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                           │
│                                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Auth    │  │  User    │  │  Product │  │  Order   │  │  Chat    │       │
│  │   DB     │  │   DB     │  │   DB     │  │   DB     │  │   DB     │       │
│  │(Postgres)│  │(Postgres)│  │(Postgres)│  │(Postgres)│  │(Postgres)│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Payment  │  │ Search   │  │ Cache    │  │ Analytics│                      │
│  │   DB     │  │  Engine  │  │  Layer   │  │   DB     │                      │
│  │(Postgres)│  │(Elastic) │  │ (Redis)  │  │(Timescale)│                     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                          │                       │
                          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       OBSERVABILITY LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Prometheus  │  │   Grafana    │  │    ELK       │  │  Jaeger      │      │
│  │   Metrics    │  │  Dashboards  │  │    Stack     │  │   Tracing    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Luồng dữ liệu chính
1. **Client** gửi yêu cầu → **API Gateway** (xác thực, giới hạn tốc độ) → định tuyến đến **Microservice** phù hợp.
2. Các microservice giao tiếp đồng bộ qua **gRPC/Feign** và bất đồng bộ qua **Kafka/RabbitMQ**.
3. Dữ liệu được lưu trong các database riêng biệt (mỗi service một database).
4. Các sự kiện (event) được phát sinh để đồng bộ dữ liệu sang **Elasticsearch** cho tìm kiếm, và sang **Analytics** cho thống kê.
5. Toàn bộ hoạt động được giám sát qua **Prometheus/Grafana**, log qua **ELK**, và trace qua **Jaeger**.

#### Cấu trúc thư mục Monorepo hoàn chỉnh:

```
ecommerce-microservices/
│
├── backend/
│   ├── auth-service/                    # Xác thực & Phân quyền
│   │   ├── src/main/java/com/c2c/auth/
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   └── TokenController.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── OAuth2Service.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   └── RefreshTokenRepository.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   └── RefreshToken.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   └── RegisterRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── AuthResponse.java
│   │   │   │       └── TokenResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtConfig.java
│   │   │   │   └── RedisConfig.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   └── UserEventProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── AuthEventConsumer.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── CustomExceptions.java
│   │   │   └── util/
│   │   │       ├── PasswordEncoder.java
│   │   │       └── TokenGenerator.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   ├── application-dev.yml
│   │   │   ├── application-prod.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_users_table.sql
│   │   │       └── V2__create_refresh_tokens_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── user-service/                    # Quản lý User Profile
│   │   ├── src/main/java/com/c2c/user/
│   │   │   ├── controller/
│   │   │   │   ├── UserController.java
│   │   │   │   ├── ProfileController.java
│   │   │   │   └── AddressController.java
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   ├── ProfileService.java
│   │   │   │   └── AddressService.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProfileRepository.java
│   │   │   │   └── AddressRepository.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── ClientProfile.java
│   │   │   │   └── UserAddress.java
│   │   │   ├── dto/
│   │   │   │   ├── UserProfileDTO.java
│   │   │   │   └── AddressDTO.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── FeignConfig.java
│   │   │   ├── messaging/
│   │   │   │   └── consumer/
│   │   │   │       └── UserEventConsumer.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── client/
│   │   │       ├── ProductServiceClient.java
│   │   │       └── OrderServiceClient.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_users_table.sql
│   │   │       ├── V2__create_client_profiles_table.sql
│   │   │       ├── V3__create_user_addresses_table.sql
│   │   │       └── V4__create_user_ratings_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── product-service/                 # Quản lý Sản phẩm
│   │   ├── src/main/java/com/c2c/product/
│   │   │   ├── controller/
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── ImageController.java
│   │   │   │   └── FavoriteController.java
│   │   │   ├── service/
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── CategoryService.java
│   │   │   │   ├── ImageService.java
│   │   │   │   ├── FavoriteService.java
│   │   │   │   └── BoostService.java
│   │   │   ├── repository/
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── CategoryRepository.java
│   │   │   │   ├── ImageRepository.java
│   │   │   │   └── FavoriteRepository.java
│   │   │   ├── model/
│   │   │   │   ├── Product.java
│   │   │   │   ├── Category.java
│   │   │   │   ├── ProductImage.java
│   │   │   │   ├── ProductFavorite.java
│   │   │   │   └── BoostPackage.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── ProductCreateRequest.java
│   │   │   │   │   └── ProductUpdateRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── ProductResponse.java
│   │   │   │       └── ProductListResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── ElasticsearchConfig.java
│   │   │   │   └── RedisConfig.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   ├── ProductEventProducer.java
│   │   │   │   │   └── SearchIndexProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── ProductEventConsumer.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── util/
│   │   │       ├── SlugGenerator.java
│   │   │       └── ProductValidator.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_categories_table.sql
│   │   │       ├── V2__create_products_table.sql
│   │   │       ├── V3__create_product_images_table.sql
│   │   │       ├── V4__create_product_favorites_table.sql
│   │   │       └── V5__create_boost_packages_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── search-service/                  # Tìm kiếm Elasticsearch
│   │   ├── src/main/java/com/c2c/search/
│   │   │   ├── controller/
│   │   │   │   ├── SearchController.java
│   │   │   │   └── SuggestionController.java
│   │   │   ├── service/
│   │   │   │   ├── SearchService.java
│   │   │   │   ├── IndexService.java
│   │   │   │   └── SuggestionService.java
│   │   │   ├── repository/
│   │   │   │   └── ProductElasticsearchRepository.java
│   │   │   ├── model/
│   │   │   │   └── ProductDocument.java
│   │   │   ├── dto/
│   │   │   │   ├── SearchRequest.java
│   │   │   │   └── SearchResponse.java
│   │   │   ├── config/
│   │   │   │   ├── ElasticsearchConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── messaging/
│   │   │   │   └── consumer/
│   │   │   │       └── SearchIndexConsumer.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── order-service/                   # Quản lý Đơn hàng
│   │   ├── src/main/java/com/c2c/order/
│   │   │   ├── controller/
│   │   │   │   ├── OrderController.java
│   │   │   │   └── ShippingController.java
│   │   │   ├── service/
│   │   │   │   ├── OrderService.java
│   │   │   │   ├── OrderHistoryService.java
│   │   │   │   └── ShippingService.java
│   │   │   ├── repository/
│   │   │   │   ├── OrderRepository.java
│   │   │   │   ├── OrderHistoryRepository.java
│   │   │   │   └── ShippingRepository.java
│   │   │   ├── model/
│   │   │   │   ├── Order.java
│   │   │   │   ├── OrderHistory.java
│   │   │   │   └── ShippingInfo.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   └── OrderCreateRequest.java
│   │   │   │   └── response/
│   │   │   │       └── OrderResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── SagaConfig.java
│   │   │   ├── saga/
│   │   │   │   ├── OrderSagaOrchestrator.java
│   │   │   │   ├── OrderSagaStep.java
│   │   │   │   └── compensation/
│   │   │   │       ├── InventoryCompensation.java
│   │   │   │       └── PaymentCompensation.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   └── OrderEventProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── OrderEventConsumer.java
│   │   │   ├── client/
│   │   │   │   ├── ProductServiceClient.java
│   │   │   │   ├── PaymentServiceClient.java
│   │   │   │   └── NotificationServiceClient.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_orders_table.sql
│   │   │       ├── V2__create_order_history_table.sql
│   │   │       └── V3__create_shipping_info_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── payment-service/                 # Thanh toán & Ví
│   │   ├── src/main/java/com/c2c/payment/
│   │   │   ├── controller/
│   │   │   │   ├── PaymentController.java
│   │   │   │   ├── TransactionController.java
│   │   │   │   └── WalletController.java
│   │   │   ├── service/
│   │   │   │   ├── PaymentService.java
│   │   │   │   ├── TransactionService.java
│   │   │   │   ├── WalletService.java
│   │   │   │   └── VNPayService.java
│   │   │   ├── repository/
│   │   │   │   ├── TransactionRepository.java
│   │   │   │   └── AuditTrailRepository.java
│   │   │   ├── model/
│   │   │   │   ├── Transaction.java
│   │   │   │   └── AuditTrail.java
│   │   │   ├── dto/
│   │   │   │   ├── PaymentRequest.java
│   │   │   │   └── PaymentResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── VNPayConfig.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   └── PaymentEventProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── PaymentEventConsumer.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── util/
│   │   │       └── PaymentValidator.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_transactions_table.sql
│   │   │       └── V2__create_audit_trail_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── chat-service/                    # Chat realtime
│   │   ├── src/main/java/com/c2c/chat/
│   │   │   ├── controller/
│   │   │   │   ├── ConversationController.java
│   │   │   │   └── MessageController.java
│   │   │   ├── service/
│   │   │   │   ├── ConversationService.java
│   │   │   │   ├── MessageService.java
│   │   │   │   └── WebSocketService.java
│   │   │   ├── repository/
│   │   │   │   ├── ConversationRepository.java
│   │   │   │   ├── MessageRepository.java
│   │   │   │   └── ParticipantRepository.java
│   │   │   ├── model/
│   │   │   │   ├── Conversation.java
│   │   │   │   ├── Message.java
│   │   │   │   └── ConversationParticipant.java
│   │   │   ├── dto/
│   │   │   │   ├── MessageRequest.java
│   │   │   │   └── MessageResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   └── RedisConfig.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   └── ChatEventProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── ChatEventConsumer.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_conversations_table.sql
│   │   │       ├── V2__create_conversation_participants_table.sql
│   │   │       └── V3__create_messages_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── notification-service/            # Thông báo
│   │   ├── src/main/java/com/c2c/notification/
│   │   │   ├── controller/
│   │   │   │   └── NotificationController.java
│   │   │   ├── service/
│   │   │   │   ├── NotificationService.java
│   │   │   │   ├── EmailService.java
│   │   │   │   ├── SmsService.java
│   │   │   │   └── PushNotificationService.java
│   │   │   ├── repository/
│   │   │   │   └── NotificationRepository.java
│   │   │   ├── model/
│   │   │   │   └── Notification.java
│   │   │   ├── dto/
│   │   │   │   ├── NotificationRequest.java
│   │   │   │   └── NotificationResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── EmailConfig.java
│   │   │   │   └── FirebaseConfig.java
│   │   │   ├── messaging/
│   │   │   │   └── consumer/
│   │   │   │       └── NotificationConsumer.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       └── V1__create_notifications_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── analytics-service/               # Analytics & Report
│   │   ├── src/main/java/com/c2c/analytics/
│   │   │   ├── controller/
│   │   │   │   ├── DashboardController.java
│   │   │   │   └── ReportController.java
│   │   │   ├── service/
│   │   │   │   ├── AnalyticsService.java
│   │   │   │   ├── ReportService.java
│   │   │   │   └── SystemReportService.java
│   │   │   ├── repository/
│   │   │   │   ├── SystemReportRepository.java
│   │   │   │   └── AdminLogRepository.java
│   │   │   ├── model/
│   │   │   │   ├── SystemReport.java
│   │   │   │   └── AdminLog.java
│   │   │   ├── dto/
│   │   │   │   ├── ReportRequest.java
│   │   │   │   └── DashboardData.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── TimescaleDBConfig.java
│   │   │   ├── messaging/
│   │   │   │   └── consumer/
│   │   │   │       └── AnalyticsConsumer.java
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── db/migration/
│   │   │       ├── V1__create_system_reports_table.sql
│   │   │       └── V2__create_admin_logs_table.sql
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── saga-orchestrator/               # Saga Pattern Orchestrator
│   │   ├── src/main/java/com/c2c/saga/
│   │   │   ├── orchestrator/
│   │   │   │   ├── SagaOrchestrator.java
│   │   │   │   ├── OrderSagaOrchestrator.java
│   │   │   │   └── SagaStep.java
│   │   │   ├── step/
│   │   │   │   ├── ValidateProductStep.java
│   │   │   │   ├── ReserveInventoryStep.java
│   │   │   │   ├── ProcessPaymentStep.java
│   │   │   │   ├── CreateOrderStep.java
│   │   │   │   └── SendNotificationStep.java
│   │   │   ├── compensation/
│   │   │   │   ├── CompensationHandler.java
│   │   │   │   └── CompensationRegistry.java
│   │   │   ├── state/
│   │   │   │   ├── SagaState.java
│   │   │   │   └── SagaStateMachine.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── KafkaConfig.java
│   │   │   ├── messaging/
│   │   │   │   ├── producer/
│   │   │   │   │   └── SagaEventProducer.java
│   │   │   │   └── consumer/
│   │   │   │       └── SagaEventConsumer.java
│   │   │   └── exception/
│   │   │       └── SagaException.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── api-gateway/                     # Spring Cloud Gateway
│   │   ├── src/main/java/com/c2c/gateway/
│   │   │   ├── config/
│   │   │   │   ├── GatewayConfig.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RateLimiterConfig.java
│   │   │   │   └── CorsConfig.java
│   │   │   ├── filter/
│   │   │   │   ├── AuthenticationFilter.java
│   │   │   │   ├── LoggingFilter.java
│   │   │   │   └── RateLimiterFilter.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── util/
│   │   │       └── JwtUtil.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── discovery-service/               # Service Registry (Eureka)
│   │   ├── src/main/java/com/c2c/discovery/
│   │   │   └── DiscoveryApplication.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── config-server/                   # Centralized Configuration
│   │   ├── src/main/java/com/c2c/config/
│   │   │   └── ConfigServerApplication.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── config-repo/
│   │   │       ├── auth-service.yml
│   │   │       ├── user-service.yml
│   │   │       ├── product-service.yml
│   │   │       └── ...
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── shared-lib/                      # Shared Library
│   │   ├── src/main/java/com/c2c/shared/
│   │   │   ├── dto/
│   │   │   │   ├── UserDTO.java
│   │   │   │   ├── ProductDTO.java
│   │   │   │   ├── OrderDTO.java
│   │   │   │   └── PaymentDTO.java
│   │   │   ├── event/
│   │   │   │   ├── OrderEvent.java
│   │   │   │   ├── PaymentEvent.java
│   │   │   │   └── NotificationEvent.java
│   │   │   ├── exception/
│   │   │   │   ├── BusinessException.java
│   │   │   │   └── ErrorCode.java
│   │   │   ├── util/
│   │   │   │   ├── JsonUtils.java
│   │   │   │   └── DateUtils.java
│   │   │   └── constant/
│   │   │       ├── ServiceConstants.java
│   │   │       └── MessageConstants.java
│   │   ├── pom.xml
│   │   └── README.md
│   │
│   └── pom.xml                          # Parent POM (quản lý dependency chung)
│
├── frontend/
│   ├── apps/
│   │   ├── web/                         # Main Web Application (Next.js)
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── (auth)/
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── register/
│   │   │   │   │   │   └── forgot-password/
│   │   │   │   │   ├── (main)/
│   │   │   │   │   │   ├── page.tsx              # Homepage
│   │   │   │   │   │   ├── product/
│   │   │   │   │   │   │   ├── [slug]/
│   │   │   │   │   │   │   └── create/
│   │   │   │   │   │   ├── category/
│   │   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │   ├── search/
│   │   │   │   │   │   ├── profile/
│   │   │   │   │   │   ├── chat/
│   │   │   │   │   │   └── orders/
│   │   │   │   │   ├── admin/                    # Admin Dashboard
│   │   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── users/
│   │   │   │   │   │   ├── products/
│   │   │   │   │   │   ├── orders/
│   │   │   │   │   │   ├── reports/
│   │   │   │   │   │   └── settings/
│   │   │   │   │   └── api/                      # API Routes (BFF)
│   │   │   │   │       ├── auth/
│   │   │   │   │       ├── products/
│   │   │   │   │       └── ...
│   │   │   │   ├── components/
│   │   │   │   │   ├── ui/                       # Shadcn UI Components
│   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   ├── Input.tsx
│   │   │   │   │   │   ├── Card.tsx
│   │   │   │   │   │   └── ...
│   │   │   │   │   ├── layout/                   # Layout components
│   │   │   │   │   │   ├── Header.tsx
│   │   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   │   └── Sidebar.tsx
│   │   │   │   │   ├── product/                  # Product features
│   │   │   │   │   │   ├── ProductCard.tsx
│   │   │   │   │   │   ├── ProductList.tsx
│   │   │   │   │   │   ├── ProductDetail.tsx
│   │   │   │   │   │   └── ProductForm.tsx
│   │   │   │   │   ├── order/                    # Order features
│   │   │   │   │   │   ├── OrderCard.tsx
│   │   │   │   │   │   └── CheckoutForm.tsx
│   │   │   │   │   ├── chat/                     # Chat features
│   │   │   │   │   │   ├── ChatList.tsx
│   │   │   │   │   │   └── ChatWindow.tsx
│   │   │   │   │   └── common/                   # Common components
│   │   │   │   │       ├── Loader.tsx
│   │   │   │   │       └── ErrorBoundary.tsx
│   │   │   │   ├── lib/
│   │   │   │   │   ├── api/                      # API Clients
│   │   │   │   │   │   ├── axios.ts
│   │   │   │   │   │   ├── auth-api.ts
│   │   │   │   │   │   ├── product-api.ts
│   │   │   │   │   │   ├── order-api.ts
│   │   │   │   │   │   └── chat-api.ts
│   │   │   │   │   ├── hooks/                    # Custom Hooks
│   │   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   │   ├── useSearch.ts
│   │   │   │   │   │   ├── useCart.ts
│   │   │   │   │   │   └── useWebSocket.ts
│   │   │   │   │   ├── store/                    # Zustand Store
│   │   │   │   │   │   ├── auth-store.ts
│   │   │   │   │   │   ├── product-store.ts
│   │   │   │   │   │   ├── chat-store.ts
│   │   │   │   │   │   └── ui-store.ts
│   │   │   │   │   ├── types/                    # TypeScript types
│   │   │   │   │   │   ├── user.ts
│   │   │   │   │   │   ├── product.ts
│   │   │   │   │   │   ├── order.ts
│   │   │   │   │   │   └── api.ts
│   │   │   │   │   └── utils/                    # Utility functions
│   │   │   │   │       ├── format.ts
│   │   │   │   │       ├── validation.ts
│   │   │   │   │       └── constants.ts
│   │   │   │   ├── middleware/                   # Next.js Middleware
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   └── rate-limit.ts
│   │   │   │   ├── styles/
│   │   │   │   │   ├── globals.css
│   │   │   │   │   └── tailwind.css
│   │   │   │   └── config/
│   │   │   │       ├── site.config.ts
│   │   │   │       └── api.config.ts
│   │   │   ├── public/
│   │   │   │   ├── images/
│   │   │   │   ├── icons/
│   │   │   │   └── fonts/
│   │   │   ├── __tests__/
│   │   │   │   ├── unit/
│   │   │   │   └── integration/
│   │   │   ├── Dockerfile
│   │   │   ├── next.config.js
│   │   │   ├── tailwind.config.ts
│   │   │   ├── tsconfig.json
│   │   │   └── package.json
│   │   └── admin/                         # Admin Dashboard (separate Next.js app)
│   │       ├── src/
│   │       │   └── ... (similar structure)
│   │       ├── Dockerfile
│   │       └── package.json
│   └── shared/                            # Shared frontend code
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml              # Local development
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   └── .env.example
│   │
│   ├── k8s/                                # Kubernetes Manifests
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   └── secrets.yaml
│   │   ├── services/
│   │   │   ├── api-gateway/
│   │   │   │   ├── deployment.yaml
│   │   │   │   └── service.yaml
│   │   │   ├── auth-service/
│   │   │   │   ├── deployment.yaml
│   │   │   │   └── service.yaml
│   │   │   └── ... (mỗi service một folder)
│   │   ├── ingress/
│   │   │   └── ingress.yaml
│   │   └── monitoring/
│   │       ├── prometheus/
│   │       ├── grafana/
│   │       └── loki/
│   │
│   ├── helm/                               # Helm Charts
│   │   ├── ecommerce/
│   │   │   ├── Chart.yaml
│   │   │   ├── values.yaml
│   │   │   ├── values-dev.yaml
│   │   │   ├── values-prod.yaml
│   │   │   └── templates/
│   │   │       ├── _helpers.tpl
│   │   │       ├── deployment.yaml
│   │   │       ├── service.yaml
│   │   │       ├── ingress.yaml
│   │   │       └── configmap.yaml
│   │   └── ...
│   │
│   ├── terraform/                          # Infrastructure as Code
│   │   ├── aws/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   ├── vpc/
│   │   │   ├── ecs/
│   │   │   ├── rds/
│   │   │   ├── elasticache/
│   │   │   └── elasticsearch/
│   │   └── ...
│   │
│   ├── monitoring/                         # Monitoring Configs
│   │   ├── prometheus/
│   │   │   ├── prometheus.yml
│   │   │   └── rules/
│   │   │       └── alerts.yml
│   │   ├── grafana/
│   │   │   └── dashboards/
│   │   │       ├── jvm.json
│   │   │       ├── business.json
│   │   │       └── infrastructure.json
│   │   └── loki/
│   │       └── loki-config.yaml
│   │
│   └── scripts/
│       ├── build.sh
│       ├── deploy.sh
│       ├── migrate.sh
│       └── seed-data.sh
│
├── docs/
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── database-design.md
│   │   └── api-design.md
│   ├── api/
│   │   ├── openapi/
│   │   │   ├── auth-service.yaml
│   │   │   ├── product-service.yaml
│   │   │   └── ...
│   │   └── postman/
│   │       └── collection.json
│   ├── deployment/
│   │   ├── deployment-guide.md
│   │   └── troubleshooting.md
│   └── development/
│       ├── setup-guide.md
│       ├── coding-standards.md
│       └── git-workflow.md
│
├── .github/
│   └── workflows/                          # CI/CD Pipelines
│       ├── ci.yml
│       ├── cd-dev.yml
│       ├── cd-prod.yml
│       └── security-scan.yml
│
├── .gitignore
├── .editorconfig
├── README.md
└── LICENSE
```
