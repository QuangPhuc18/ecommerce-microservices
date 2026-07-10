# 04. Technology Stack

The following table summarizes the technological components, frameworks, databases, and tools utilized across the **ĐồCũ** secondhand e-commerce platform.

| Layer | Technology | Used In | Purpose | Why Selected |
| ----- | ---------- | ------- | ------- | ------------ |
| **Frontend** | React 18 | `frontend` | Core rendering engine for the single-page application (SPA). | Promotes component reuse, virtual DOM rendering, and is supported by a large community ecosystem. |
| **Frontend** | Vite | `frontend` | Build tool and dev server. | Provides extremely fast hot module replacement (HMR) and optimized build times compared to Webpack. |
| **Frontend** | Tailwind CSS | `frontend` | Styling utility classes. | Enables rapid UI prototyping directly in HTML/JSX with utility classes, keeping style files small. |
| **Frontend** | Axios | `frontend` | HTTP Client library. | Easy-to-use API for sending HTTP requests, parsing JSON, and utilizing interceptors for global JWT management. |
| **Frontend** | React Router | `frontend` | Client-side routing. | Provides declarative routing configurations, support for layout outlets, and route-based access restrictions. |
| **Backend** | Java 21 | All Microservices | Core programming language. | Offers modern features (virtual threads, records), strong typing, high performance, and enterprise-grade stability. |
| **Backend** | Spring Boot 3.3.5 | All Microservices | Core backend framework. | Fast bootstrapping, dependency injection, auto-configurations, and native support for cloud architectures. |
| **Backend** | Spring Cloud Gateway | `api-gateway` | Edge proxy and API routing. | Dynamic route configuration, reactive performance, and simple filter structures to implement global security rules. |
| **Backend** | Netflix Eureka Server | `eureka-server` | Service discovery registry. | Out-of-the-box support for Spring Cloud, enabling microservices to register and locate each other dynamically. |
| **Backend** | Spring Security | `user-`, `order-`, `chat-` | API authentication filters. | Standard security library for role-based access control, header validation, and token authentication. |
| **Backend** | Spring WebSocket (STOMP) | `chat-service`, `notification-service` | Real-time connection management. | Emits server-side events directly to users without complex polling loops, using STOMP protocols. |
| **Datastore** | MySQL 8.0 | Core Services (split databases) | Relational persistence. | Relational integrity, support for complex transactions, performance, and strong support across standard hosting systems. |
| **Datastore** | Redis | `user-service` | Cache / Temporary store. | In-memory key-value data store, optimal for short-term tokens requiring automated time-to-live (TTL) eviction. |
| **Datastore** | Elasticsearch 8.10.2 | `product-service` (Development placeholder) | Full-text search engine. | High-performance search capability (reserved for future optimization). |
| **Messaging** | RabbitMQ 3 | Async Pipelines | Message broker. | Reliability, AMQP standards compliance, lightweight memory footprint, and native support for exchange-routing systems. |
| **Integration** | VNPay Sandbox | `payment-service` | Online payment processor. | Vietnamese payment standard, providing safe payment url generations and checksum validations. |
| **Development** | Lombok | All Microservices | Boilerplate reducer. | Generates getters, setters, constructors, builders, and loggers automatically via compiler annotations. |
| **Development** | Docker & Docker Compose | Entire Repository | Local orchestration and containerization. | Ensures execution parity between local development and production servers, packaging dependencies inside isolated environments. |
| **Testing** | JUnit & Mockito | All Microservices | Automated testing. | Standard Java testing framework, allowing isolated component verification using mock behaviors. |
