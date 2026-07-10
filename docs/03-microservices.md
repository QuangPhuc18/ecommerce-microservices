# 03. Microservices Documentation

This document provides a comprehensive technical reference for each microservice in the **ĐồCũ** secondhand e-commerce platform.

---

## 1. Eureka Server (Service Registry)

### Purpose
Acts as the central directory for service discovery, enabling dynamic client-side load balancing and routing without hardcoded IP addresses.

* **Technology**: Java 21, Spring Boot, Spring Cloud Netflix Eureka Server.
* **Port**: `8761`
* **Configuration**: Configured to disable self-preservation in development environments and prevent registering itself as a client.
* **Communication**: Downstream services register via HTTP heartbeats; the API Gateway queries it dynamically to resolve service locations.

---

## 2. API Gateway

### Purpose
The entry point for all clients, decoupling the client applications from the backend microservice network layout.

* **Technology**: Spring Cloud Gateway, WebFlux (Project Reactor).
* **Port**: `8088`
* **Responsibilities**:
  * **Routing**: Maps public paths (e.g. `/products/**`) to service instances using dynamic Eureka lookups (`lb://product-service`).
  * **Edge Security**: Runs `AuthenticationFilter` to validate JWT authorization headers.
  * **Context Ingestion**: Parses token claims and forwards `X-User-Id` and `X-User-Role` headers to downstream microservices.
  * **CORS Management**: Injects global CORS configuration enabling wildcards (`*`) for origins, headers, and methods (GET, POST, PUT, DELETE, OPTIONS).
* **Open Endpoints (Bypass Security)**:
  * `/auth/register`, `/auth/login`, `/auth/refresh`
  * `/users/register`, `/users/login`
  * `/products/categories`
  * `/eureka`
  * `/v3/api-docs`, `/swagger-ui`
  * Public `GET` requests to `/products/**` and `/media/images/**`

---

## 3. User Service

### Purpose
Manages user accounts, authentication tokens, security contexts, and user profiles.

* **Technology**: Spring Boot, Spring Security, Spring Data JPA, Redis.
* **Port**: `8085`
* **Database**: `user_db` (MySQL)
* **Caching**: Redis (storing Refresh Tokens with 7-day TTL).
* **Responsibilities**:
  * **Registration & Sign-in**: Secure password storage utilizing BCrypt hash verification.
  * **Dual-Token Handshake**: Emits short-lived JWT tokens and registers long-lived Refresh Tokens in Redis.
  * **Session Management**: Revokes Refresh Tokens upon user logout.
  * **Profile Editing**: Updates user fields (name, phone, avatar URL).
* **Messaging**:
  * **Listener**: Listens to `order_queue` to receive order confirmation strings. Simulates background workflows (e.g. sending a verification email to the user).
* **Selected Technology Rationale**: Spring Security offers robust filter structures for token authentication. Redis is optimal for token blacklisting and session timeouts due to high throughput and automated TTL eviction.
* **Improvements**: Implement password reset flows (with verification codes), email validation, and OAuth2 social logins (Google/Facebook).

---

## 4. Product Service

### Purpose
Handles the product catalog, dynamic specifications, category definitions, and user bookmark lists.

* **Technology**: Spring Boot, Spring Data JPA.
* **Port**: `8081`
* **Database**: `product_db` (MySQL)
* **Responsibilities**:
  * **Listing CRUD**: Creates, updates, and deletes secondhand item postings.
  * **Dynamic Filtering**: Implements Spring Data Specification (`ProductSpecification`) allowing combinatoric queries over keyword, category, location, min/max price, item condition, and status.
  * **Bumping System**: Allows sellers to modify `bumpedAt` timestamps, moving their listings to the top of catalog queries.
  * **Favorites**: Allows users to save items to their favorites (persisted in `favorite_products` table).
* **Technical Note on Elasticsearch**:
  * The service includes Elasticsearch dependencies and repository classes (`ProductSearchRepository`, `ProductDocument`). However, it currently excludes Elasticsearch auto-configuration, relying instead on JPA SQL Specification for search operations.
* **Selected Technology Rationale**: Spring Data Specification makes dynamic, multi-parameter SQL search simple to maintain without writing raw queries.
* **Improvements**: Fully enable the Elasticsearch integration to enable fuzzy text searches, synonyms, and high-performance indexing. Add scheduled cron jobs to automatically mark items as expired.

---

## 5. Order Service

### Purpose
Coordinates order processing, validating purchase details across domains, and recording order transactions.

* **Technology**: Spring Boot, Spring Data JPA, `RestTemplate`.
* **Port**: `8082`
* **Database**: `order_db` (MySQL)
* **Responsibilities**:
  * **Order Placement**: Receives buying requests containing product IDs and quantities.
  * **Synchronous Verification**: Calls `user-service` to confirm the buyer exists, and loops through `product-service` to fetch current item pricing.
  * **Asynchronous Integration**: Publishes an order confirmation string to RabbitMQ's `order_queue` upon saving the transaction.
* **Selected Technology Rationale**: Separating orders from products ensures transactional isolation. Spring Data JPA easily handles order item relations.
* **Improvements**: Add transaction rollback flows (Saga pattern) if inventory validation fails. Integrate status tracking (Pending, Confirmed, Shipped, Cancelled).

---

## 6. Chat Service

### Purpose
Enables buyer-seller communications directly tied to specific product listings.

* **Technology**: Spring Boot, Spring Security, Spring Data JPA, Spring WebSocket (STOMP message broker).
* **Port**: `8086`
* **Database**: `chat_db` (MySQL)
* **Responsibilities**:
  * **Room Management**: Creates or retrieves chat rooms mapping `(buyerId, sellerId, productId)`.
  * **Message Archival**: Persists chat bubbles (text, images, location coordinates) in MySQL.
  * **Unread Tracker**: Tracks unread message counts per user.
  * **Real-time Dispatch**: Emits events to `/topic/chat/{roomId}` via WebSocket.
  * **MQ Notification**: Publishes a formatted string (`CHAT|sender|receiver|roomId|content`) to RabbitMQ `chat.exchange` with routing key `chat.notification.new` to alert offline users.
* **Selected Technology Rationale**: Spring WebSocket provides a native STOMP broker, reducing the need for external brokers in development.
* **Improvements**: Migrate from polling (which the React client currently falls back on) to persistent STOMP WebSocket connections. Add support for typing indicators and message deletes.

---

## 7. Media Service

### Purpose
Handles file storage, hosting, and serving image assets.

* **Technology**: Spring Boot, Local Filesystem storage.
* **Port**: `8083`
* **Database**: *None (No database required)*
* **Responsibilities**:
  * **Upload**: Accepts file streams, generates unique filenames, saves them to a configurable storage folder (`./uploads`), and returns the file's path.
  * **Asset Serving**: Streams requested images with appropriate media type headers (image/png, image/jpeg, image/gif).
* **Selected Technology Rationale**: Lightweight storage handling without database overhead, allowing simple integration with local server environments.
* **Improvements**: Add file resizing and compression dynamically before saving to conserve space. Replace local storage with cloud object storage (e.g. AWS S3 or MinIO) for cloud-native deployment.

---

## 8. Notification Service

### Purpose
Manages system-wide alerts, processing inbound events and routing them to users.

* **Technology**: Spring Boot, Spring Data JPA, Spring WebSocket (STOMP broker), `RestTemplate`.
* **Port**: `8087`
* **Database**: `notification_db` (MySQL)
* **Responsibilities**:
  * **Inbound Listeners**: Listens to RabbitMQ `chat_queue`.
  * **Context Enrichment**: Upon receiving a chat notification message, it calls `user-service` synchronously via HTTP REST to fetch the sender's full name.
  * **State Retention**: Saves the notification to `notifications` table with `isRead = false`.
  * **Client Push**: Dispatches real-time alerts over WebSocket to `/topic/notifications/{userId}`.
* **Selected Technology Rationale**: AMQP listener makes event ingestion non-blocking. Decoupling notifications from the chat service ensures chat operations are fast and failure-resistant.
* **Improvements**: Integrate email notifications or Firebase Cloud Messaging (FCM) for mobile push notifications.

---

## 9. Review Service

### Purpose
Allows buyers to review and score sellers, establishing platform trust.

* **Technology**: Spring Boot, Spring Data JPA.
* **Port**: `8089`
* **Database**: `review_db` (MySQL)
* **Responsibilities**:
  * **Review Submission**: Saves review records containing scores (1-5 stars), comments, and image attachments.
  * **Seller Reply**: Enables sellers to respond to a specific review.
  * **Average Computation**: Dynamically calculates average scores for users.
* **Selected Technology Rationale**: Relational databases excel at aggregating review scores and maintaining comment feeds.
* **Improvements**: Enforce check policies requiring users to have completed an order with a seller before leaving a review (preventing rating manipulation).

---

## 10. Payment Service

### Purpose
Manages online transactions, integrating VNPay payment gateway.

* **Technology**: Spring Boot, VNPAY Sandbox API.
* **Port**: `8090`
* **Database**: *None (Integrations only)*
* **Responsibilities**:
  * **Redirect Creation**: Compiles merchant code, transaction parameters, return URL, and secret key to construct a secure VNPay gateway URL.
  * **Checksum Verification**: Captures return calls and validates the HMAC-SHA512 signature to verify authenticity.
* **Selected Technology Rationale**: Lightweight stateless service focused purely on cryptographic validation and payment routing.
* **Improvements**: Persist transaction histories in a database. Implement a scheduler to verify payment status with VNPay if return callbacks are missed (polling query DR). Send RabbitMQ completion events to `order-service` to mark orders as paid.
