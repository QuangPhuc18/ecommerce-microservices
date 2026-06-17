## 2. Bản thiết kế tổng quan đã tinh chỉnh

### 2.1 Tổng quan kiến trúc

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

---

### 5.1 Bản thiết kế kiến trúc Backend chi tiết

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

---

### 5.2 Bản thiết kế kiến trúc Frontend chi tiết

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND ARCHITECTURE                                 │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         NEXT.JS 14+ (App Router)                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│          ┌───────────────────────────┼───────────────────────────┐            │
│          │                           │                           │            │
│          ▼                           ▼                           ▼            │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                    │
│  │  Server       │   │  Client       │   │  Middleware   │                    │
│  │  Components   │   │  Components   │   │               │                    │
│  │  (RSC)        │   │  (CSR)        │   │  • Auth       │                    │
│  └───────────────┘   └───────────────┘   │  • Rate Limit │                    │
│          │                   │           │  • Geo        │                    │
│          │                   │           └───────────────┘                    │
│          ▼                   ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      STATE MANAGEMENT (Zustand)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Auth Store  │  │  Product     │  │  Chat Store  │  │  UI Store    │ │ │
│  │  │              │  │  Store       │  │              │  │              │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         API CLIENT LAYER                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Axios      │  │   React      │  │   SWR/       │  │  WebSocket   │ │ │
│  │  │  Instance    │  │   Query      │  │  TanStack    │  │  Client      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      BFF (Backend for Frontend)                          │ │
│  │  • API Routes (Next.js) • Data Aggregation • Response Transformation     │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│                                      ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                       API GATEWAY (Spring Cloud Gateway)                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                         │
│          ┌───────────────────────────┼───────────────────────────┐            │
│          │                           │                           │            │
│          ▼                           ▼                           ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Product    │  │   Order      │  │   Chat       │      │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Feature-based organization:

```
frontend/apps/web/src/app/
├── (auth)/                          # Auth routes (no layout)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── (main)/                          # Main layout (header + footer)
│   ├── layout.tsx                   # Main layout wrapper
│   ├── page.tsx                     # Homepage
│   ├── product/
│   │   ├── [slug]/
│   │   │   └── page.tsx             # Product detail
│   │   ├── create/
│   │   │   └── page.tsx             # Create product
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx         # Edit product
│   ├── category/
│   │   └── [slug]/
│   │       ├── page.tsx             # Category listing
│   │       └── loading.tsx
│   ├── search/
│   │   ├── page.tsx                 # Search results
│   │   └── loading.tsx
│   ├── profile/
│   │   ├── page.tsx                 # User profile
│   │   ├── settings/
│   │   │   └── page.tsx             # Profile settings
│   │   └── [id]/
│   │       └── page.tsx             # Other user profile
│   ├── chat/
│   │   ├── page.tsx                 # Chat list
│   │   └── [conversationId]/
│   │       └── page.tsx             # Chat detail
│   ├── orders/
│   │   ├── page.tsx                 # Order list
│   │   └── [id]/
│   │       └── page.tsx             # Order detail
│   └── favorites/
│       └── page.tsx                 # Favorites list
│
├── admin/                          # Admin routes (admin layout)
│   ├── layout.tsx                   # Admin layout
│   ├── dashboard/
│   │   └── page.tsx                 # Admin dashboard
│   ├── users/
│   │   ├── page.tsx                 # User management
│   │   └── [id]/
│   │       └── page.tsx             # User detail
│   ├── products/
│   │   ├── page.tsx                 # Product management
│   │   └── [id]/
│   │       └── page.tsx             # Product detail admin
│   ├── orders/
│   │   └── page.tsx                 # Order management
│   ├── reports/
│   │   └── page.tsx                 # Reports
│   └── settings/
│       └── page.tsx                 # System settings
│
└── api/                            # API Routes (BFF)
    ├── auth/
    │   ├── login/
    │   │   └── route.ts
    │   └── register/
    │       └── route.ts
    ├── products/
    │   ├── route.ts                 # GET / POST products
    │   └── [id]/
    │       └── route.ts             # GET / PUT / DELETE product
    ├── orders/
    │   └── route.ts
    ├── chat/
    │   └── route.ts
    └── search/
        └── route.ts
```

---

### 5.3 Bản thiết kế kiến trúc hoàn hảo - Tổng thể chi tiết

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      ECOMMERCE C2C MICROSERVICES - COMPLETE ARCHITECTURE       │
│                                   (Chợ Tốt - Style)                           │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                 │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   Web Application  │  │   PWA / Mobile Web │  │  Native Apps       │        │
│  │   (Next.js 14+)    │  │   (Next.js + PWA)  │  │  (React Native)    │        │
│  │   • SSR/SSG        │  │   • Offline support│  │  • iOS/Android     │        │
│  │   • SEO Optimized  │  │   • Push notif.    │  │  • Native features │        │
│  │   • Micro Frontend │  │   • Service Worker │  │  • Biometric auth  │        │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘        │
│                                      │                                           │
│                                      ▼                                           │
│                          ┌────────────────────┐                                 │
│                          │   CDN (Cloudflare) │                                 │
│                          │   • Static assets  │                                 │
│                          │   • Image opt.     │                                 │
│                          └────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Spring Cloud Gateway + Tyk (Option)                    │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │  │
│  │  │  Routing   │ │ Rate Limit │ │   Auth     │ │  CORS      │            │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │  │
│  │  │  Circuit   │ │  Retry     │ │  Logging   │ │  Cache     │            │  │
│  │  │  Breaker   │ │            │ │            │ │            │            │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                           │
│                                      ▼                                           │
│                          ┌────────────────────┐                                 │
│                          │ Service Discovery  │                                 │
│                          │   (Netflix Eureka) │                                 │
│                          └────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC LAYER                                  │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   AUTH SERVICE     │  │   USER SERVICE     │  │  PRODUCT SERVICE   │        │
│  │   (Port 8001)      │  │   (Port 8002)      │  │   (Port 8003)      │        │
│  │  ┌──────────────┐  │  │  ┌──────────────┐  │  │  ┌──────────────┐  │        │
│  │  │ JWT Manager  │  │  │  │ Profile Mgmt│  │  │  │ CRUD Product │  │        │
│  │  │ OAuth2       │  │  │  │ Address Mgmt│  │  │  │ Category     │  │        │
│  │  │ SSO          │  │  │  │ Rating Sys  │  │  │  │ Image Upload │  │        │
│  │  │ RBAC         │  │  │  │ Verification│  │  │  │ Boost Package│  │        │
│  │  └──────────────┘  │  │  └──────────────┘  │  │  └──────────────┘  │        │
│  └──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘        │
│             │                       │                       │                    │
│  ┌──────────┴─────────┐  ┌──────────┴─────────┐  ┌──────────┴─────────┐        │
│  │   ORDER SERVICE    │  │  PAYMENT SERVICE   │  │   CHAT SERVICE     │        │
│  │   (Port 8005)      │  │   (Port 8006)      │  │   (Port 8007)      │        │
│  │  ┌──────────────┐  │  │  ┌──────────────┐  │  │  ┌──────────────┐  │        │
│  │  │ Order Mgmt   │  │  │  │ VNPay/Momo   │  │  │  │ WebSocket    │  │        │
│  │  │ Order History│  │  │  │ Wallet Mgmt  │  │  │  │ Pub/Sub      │  │        │
│  │  │ Shipping     │  │  │  │ Transaction  │  │  │  │ Message Hist │  │        │
│  │  │ Saga Trigger │  │  │  │ Audit Trail  │  │  │  │ Typing...    │  │        │
│  │  └──────────────┘  │  │  └──────────────┘  │  │  └──────────────┘  │        │
│  └──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘        │
│             │                       │                       │                    │
│  ┌──────────┴─────────┐  ┌──────────┴─────────┐  ┌──────────┴─────────┐        │
│  │  SEARCH SERVICE    │  │ NOTIFICATION SVC   │  │ ANALYTICS SERVICE  │        │
│  │   (Port 8004)      │  │   (Port 8008)      │  │   (Port 8009)      │        │
│  │  ┌──────────────┐  │  │  ┌──────────────┐  │  │  ┌──────────────┐  │        │
│  │  │ Elasticsearch│  │  │  │ Email        │  │  │  │ Dashboard    │  │        │
│  │  │ Full-text    │  │  │  │ SMS          │  │  │  │ Reports      │  │        │
│  │  │ Autocomplete │  │  │  │ Push         │  │  │  │ System Logs  │  │        │
│  │  │ Filtering    │  │  │  │ In-app       │  │  │  │ BI Export    │  │        │
│  │  └──────────────┘  │  │  └──────────────┘  │  │  └──────────────┘  │        │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘        │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                                 │
│  │ SAGA ORCHESTRATOR  │  │   ADMIN SERVICE    │                                 │
│  │   (Port 8010)      │  │   (Port 8011)      │                                 │
│  │  ┌──────────────┐  │  │  ┌──────────────┐  │                                 │
│  │  │ Order Saga   │  │  │  │ Admin Mgmt   │  │                                 │
│  │  │ Compensation │  │  │  │ System Config│  │                                 │
│  │  │ State Machine│  │  │  │ Banner Mgmt  │  │                                 │
│  │  │ Rollback     │  │  │  │ Moderation   │  │                                 │
│  │  └──────────────┘  │  │  └──────────────┘  │                                 │
│  └────────────────────┘  └────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE BROKER & EVENT BUS                               │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    RabbitMQ + Apache Kafka                                │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         Event Topics                               │  │  │
│  │  │  • user.created  • product.created  • order.created                │  │  │
│  │  │  • payment.completed  • notification.sent  • search.index          │  │  │
│  │  │  • saga.started  • saga.compensated  • chat.message               │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         Dead Letter Queue                         │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                         │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   Auth DB          │  │   User DB          │  │   Product DB       │        │
│  │   PostgreSQL       │  │   PostgreSQL       │  │   PostgreSQL       │        │
│  │  • users           │  │  • client_profiles │  │  • categories      │        │
│  │  • refresh_tokens  │  │  • user_addresses  │  │  • products        │        │
│  │  • roles           │  │  • user_ratings    │  │  • product_images  │        │
│  │                    │  │                    │  │  • favorites       │        │
│  │                    │  │                    │  │  • boost_packages  │        │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘        │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   Order DB         │  │   Payment DB       │  │   Chat DB          │        │
│  │   PostgreSQL       │  │   PostgreSQL       │  │   PostgreSQL       │        │
│  │  • orders          │  │  • transactions    │  │  • conversations   │        │
│  │  • order_history   │  │  • audit_trail     │  │  • participants    │        │
│  │  • shipping_info   │  │                    │  │  • messages        │        │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘        │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   Search Engine    │  │   Cache Layer      │  │   Analytics DB     │        │
│  │   Elasticsearch    │  │   Redis Cluster    │  │   TimescaleDB      │        │
│  │  • product index   │  │  • Session         │  │  • system_reports  │        │
│  │  • autocomplete    │  │  • Cache data      │  │  • admin_logs      │        │
│  │  • geo search      │  │  • Rate limiting   │  │  • metrics         │        │
│  │                    │  │  • Distributed lock│  │                    │        │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          OBSERVABILITY LAYER                                    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      Prometheus + Grafana                                │  │
│  │  • Metrics collection  • Custom dashboards  • Alerting                  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         ELK Stack (Elasticsearch + Logstash + Kibana)    │  │
│  │  • Centralized logging  • Log analysis  • Error tracking                │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      Jaeger (Distributed Tracing)                       │  │
│  │  • Request tracing  • Performance analysis  • Bottleneck detection      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         Kubernetes (AWS/GCP/Azure)                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │  Pods      │  │  Services  │  │  Ingress   │  │  HPA       │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │  ConfigMap │  │  Secrets   │  │  PVC       │  │  Network   │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         CI/CD Pipeline                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │   Build    │→│   Test     │→│   Build    │→│  Deploy    │        │  │
│  │  │  (Maven)   │  │  (JUnit)   │  │  (Docker)  │  │  (K8s)    │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Security & Compliance                                 │  │
│  │  • SSL/TLS  • OAuth2/JWT  • Rate Limiting  • SQL Injection Prevention   │  │
│  │  • XSS Protection  • CSRF  • Data Encryption  • Audit Logging           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tóm tắt các cải tiến chính

| Hạng mục | Cải tiến | Lý do |
|---|---|---|
| **Service Discovery** | Thêm `discovery-service` (Eureka) | Đảm bảo High Availability, tự động phát hiện service |
| **Config Server** | Thêm `config-server` | Quản lý cấu hình tập trung, hỗ trợ nhiều môi trường |
| **Shared Library** | Thêm `shared-lib` với cấu trúc rõ ràng | Tránh duplicate code, đồng bộ DTO/Event giữa các service |
| **Saga Orchestrator** | Tách riêng service | Quản lý distributed transaction, đảm bảo nhất quán dữ liệu |
| **Observability** | Thêm Prometheus/Grafana/ELK/Jaeger | Monitoring, logging, tracing - yếu tố then chốt cho production |
| **Micro Frontend** | Tách admin và web thành 2 app Next.js | Độc lập deploy, phân quyền rõ ràng |
| **BFF Pattern** | API Routes trong Next.js làm BFF | Aggregation dữ liệu, giảm số lượng request từ client |
| **Message Broker** | Kafka + RabbitMQ | Kafka cho event sourcing, RabbitMQ cho async task |
| **Caching** | Redis Cluster | Session, cache, rate limiting, distributed lock |
| **CI/CD** | GitHub Actions workflows | Tự động build, test, deploy |

---

> **Lưu ý quan trọng từ Chợ Tốt:** Theo chia sẻ từ Director of Engineering tại Chợ Tốt, cần tránh "over-engineering" - không nên thiết kế quá phức tạp ngay từ đầu. Hãy bắt đầu với các service cốt lõi (Auth, User, Product, Order) và mở rộng dần khi cần thiết.

Dưới đây là bảng **tóm tắt công nghệ chi tiết cho từng hạng mục** trong kiến trúc Microservices C2C (tham khảo Chợ Tốt). Bảng này phân chia rõ ràng theo từng tầng (Layer) để bạn dễ dàng triển khai:

---

### Bảng tổng hợp công nghệ theo hạng mục

| **Hạng mục (Category)** | **Công nghệ lựa chọn** | **Phiên bản khuyến nghị** | **Vai trò / Ghi chú trong dự án** |
| :--- | :--- | :--- | :--- |
| **🖥️ Backend Framework** | Spring Boot (Java) | 3.2.x+ (Java 21 LTS) | Nền tảng chính cho tất cả Microservices. Ưu tiên Java 21 để dùng Virtual Threads (Project Loom) tối ưu I/O. |
| **🌐 API Gateway** | Spring Cloud Gateway | 4.1.x+ | Cổng điều phối duy nhất. Xử lý Routing, Rate Limiting (Redis), CORS, Circuit Breaker (Resilience4j). |
| **🧭 Service Discovery** | Netflix Eureka <br>*(hoặc Nacos)* | 2.0.x+ | Cho phép các service tự động đăng ký và tìm thấy nhau mà không cần hardcode IP (quan trọng cho K8s). |
| **⚙️ Config Server** | Spring Cloud Config Server | 4.1.x+ | Tập trung file cấu hình `application.yml` của tất cả service theo môi trường (dev/staging/prod). |
| **🗄️ Database (SQL)** | PostgreSQL | 16.x | Lưu dữ liệu giao dịch chính (User, Order, Product, Chat). Dùng JSONB cho attribute động của sản phẩm. |
| **🔎 Search Engine** | Elasticsearch | 8.11.x+ | Công cụ tìm kiếm cốt lõi. Đảm bảo tìm kiếm full-text, gợi ý (autocomplete) và lọc theo danh mục cực nhanh. |
| **⚡ Cache & Session** | Redis | 7.2.x (Cluster) | Lưu session JWT, cache dữ liệu nóng (danh mục, sản phẩm xem nhiều), Rate Limiting, và lưu tin nhắn chat tạm thời. |
| **📨 Message Broker (Async)** | Apache Kafka | 3.6.x | **Luồng chính**: Xử lý Event Sourcing, Saga Pattern, đồng bộ dữ liệu sang Elasticsearch. |
| **📨 Task Queue (Async)** | RabbitMQ | 3.12.x | **Luồng phụ**: Xử lý tác vụ nền ngắn (gửi email, SMS, tạo thumbnail ảnh) với độ trễ thấp. |
| **🔗 Sync Communication** | OpenFeign + gRPC | Spring Cloud 4.1 / gRPC 1.59 | **OpenFeign**: Giao tiếp REST giữa các service. <br>**gRPC**: Dùng cho các service cần hiệu suất cực cao (Order gọi Payment). |
| **🧩 Distributed Transaction** | Saga Orchestrator (Kafka) | Tự build | Duy trì nhất quán dữ liệu giữa Order, Payment, Inventory. Dùng Kafka để gửi các bước (step) và rollback (compensation). |
| **🖌️ Frontend Framework** | Next.js (TypeScript) | 14.x+ (App Router) | Framework React hàng đầu. Hỗ trợ SEO (SSR/SSG) cho trang sản phẩm và Dashboard Admin. |
| **🎨 Frontend UI Library** | React + Tailwind CSS | React 18, Tailwind 3.4 | **Shadcn/ui** làm component hệ thống (Button, Modal), kết hợp Tailwind để tùy biến giao diện giống Chợ Tốt. |
| **📦 Frontend State Mgmt** | Zustand + TanStack Query | Zustand 4.x, TanStack 5.x | **Zustand**: Quản lý state phức tạp (Giỏ hàng, User info). <br>**TanStack Query**: Quản lý cache và gọi API (SWR). |
| **📱 Mobile / PWA** | Next.js PWA + React Native | React Native 0.73 | Web hỗ trợ PWA (Service Worker) để dùng như app nhẹ. Nếu mở rộng sau, dùng React Native chung logic. |
| **🐳 Containerization** | Docker | 24.x+ | Đóng gói từng service (Backend, Frontend) thành image chuẩn để chạy ở bất kỳ đâu. |
| **☸️ Container Orchestration** | Kubernetes (K8s) | 1.28+ (EKS/GKE/AKS) | Quản lý toàn bộ Cluster. Tự động scale, self-healing, rolling update. |
| **📊 Infrastructure as Code** | Terraform | 1.7.x | Quản lý tài nguyên Cloud (VPC, RDS, Elasticache, EKS) bằng code, dễ dàng tạo lại hạ tầng. |
| **📈 Monitoring (Metrics)** | Prometheus + Grafana | Prometheus 2.50, Grafana 10 | Thu thập metric (CPU, RAM, Request count). Grafana vẽ dashboard real-time để theo dõi sức khỏe hệ thống. |
| **📜 Logging (Logs)** | ELK Stack (Elasticsearch, Logstash, Kibana) *hoặc* Loki | ELK 8.x / Loki 2.9 | Tập trung log từ tất cả Pods. Hỗ trợ tìm kiếm lỗi (Error tracing) theo requestId cực kỳ nhanh. |
| **🔭 Distributed Tracing** | Jaeger + OpenTelemetry | Jaeger 1.50 | Theo dõi hành trình của 1 request xuyên suốt từ Gateway -> Service A -> Service B để tìm điểm nghẽn. |
| **🔄 CI/CD Pipeline** | GitHub Actions / GitLab CI | Latest | Tự động hóa quy trình: Chạy test (Unit/Integration) -> Build Docker Image -> Push lên Registry -> Deploy lên K8s. |
| **🔐 Security (Auth)** | Spring Security 6 + JWT (OAuth2) | Spring Boot 3.x | Xác thực Stateless. Dùng JWT kết hợp RSA256 để đảm bảo an toàn. Tích hợp OAuth2 (Google/Facebook) sau này. |
| **🛡️ Secrets Management** | HashiCorp Vault *hoặc* K8s Secrets | Vault 1.15 | Lưu trữ bảo mật tuyệt đối các thông tin nhạy cảm (Password DB, API Key VNPay, JWT Private Key). |

---

### 💡 Lưu ý chiến lược khi chọn công nghệ

1. **Kafka vs RabbitMQ**: 
   - Dùng **Kafka** cho các sự kiện hệ thống lớn (khi có 1 sản phẩm được đăng, cần trigger 5-6 service khác nhau: Search, Analytics, Notification, Recommendation).
   - Dùng **RabbitMQ** cho các tác vụ đơn lẻ, yêu cầu xác nhận (ACK) ngay lập tức (như gửi email OTP).

2. **gRPC cho nội bộ**:
   - Để tăng tốc độ giao tiếp giữa `order-service` và `payment-service` (do yêu cầu độ trễ cực thấp khi thanh toán), hãy ưu tiên gRPC thay vì REST/Feign.

3. **PostgreSQL với JSONB**:
   - Vì sản phẩm ở Chợ Tốt có rất nhiều thuộc tính khác nhau theo danh mục (Điện thoại có RAM, Bất động sản có Diện tích), hãy tận dụng cột `attributes` kiểu JSONB để lưu linh hoạt mà vẫn query được.

4. **OpenTelemetry (Tracing)**:
   - Cực kỳ quan trọng trong môi trường Microservices. Hãy cấu hình ngay từ đầu để sau này không phải "hối hận" khi debug lỗi production.

Bạn có thể dùng bảng trên làm **Phụ lục Công nghệ** cho đồ án hoặc kế hoạch triển khai dự án thực tế! 🚀