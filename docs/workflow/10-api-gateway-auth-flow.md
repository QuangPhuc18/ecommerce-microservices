# 10 — API Gateway & Authentication Flow

## Tổng quan

API Gateway là entry point duy nhất cho tất cả request — xử lý routing, authentication, rate limiting, CORS, và logging.

**Services tham gia:**
- `api-gateway` (port 8080) — Spring Cloud Gateway
- `discovery-service` (port 8761) — Eureka service registry
- `config-server` (port 8888) — cấu hình
- `auth-service` (port 8001) — JWT verification

**Cache:** Redis — rate limiting
**Infrastructure:** Docker, Prometheus (monitoring)

---

## 1. Kiến trúc tổng quan

```mermaid
flowchart TD
    Client[Browser / Mobile App]
    GW[API Gateway :8080]
    DS[Discovery Service :8761]
    CS[Config Server :8888]

    subgraph Gateway Filters
        LF[LoggingFilter]
        AF[AuthenticationFilter]
        RL[Rate Limiter]
        CF[CORS Filter]
    end

    subgraph Backend Services
        A[auth-service :8001]
        U[user-service :8002]
        P[product-service :8003]
        S[search-service :8004]
        O[order-service :8005]
        Pay[payment-service :8006]
        C[chat-service :8007]
        N[notification-service :8008]
        An[analytics-service :8009]
        Saga[saga-orchestrator :8010]
    end

    Client --> GW
    GW --> LF
    LF --> AF
    AF --> RL

    RL -->|"/api/v1/auth/**"| A
    RL -->|"/api/v1/users/**"| U
    RL -->|"/api/v1/products/**"| P
    RL -->|"/api/v1/search/**"| S
    RL -->|"/api/v1/orders/**"| O
    RL -->|"/api/v1/payments/**"| Pay
    RL -->|"/api/v1/chats/**"| C
    RL -->|"/ws/**"| C
    RL -->|"/api/v1/notifications/**"| N
    RL -->|"/api/v1/reports/**"| An
    RL -->|"/api/v1/sagas/**"| Saga

    GW -.->|Service Discovery| DS
    GW -.->|Configuration| CS
```

---

## 2. Request Lifecycle

```mermaid
sequenceDiagram
    actor Client
    participant GW as API Gateway (8080)
    participant Eureka as Discovery Service
    participant TargetSvc as Target Service
    participant Redis

    Client->>GW: HTTP Request + Authorization header

    GW->>GW: CorsConfig (global CORS)
    GW->>GW: LoggingFilter (log method, path, headers)

    alt Path là public (/auth/**, /ws/**, /actuator/**)
        GW->>GW: Skip AuthenticationFilter
    else Path cần auth
        GW->>GW: AuthenticationFilter.extractToken()
        alt Token missing
            GW-->>Client: 401 MISSING_AUTH_HEADER
        else Token present
            GW->>GW: JwtUtil.validateToken(token)
            alt Token invalid / expired
                GW-->>Client: 401 INVALID_TOKEN
            else Token valid
                GW->>GW: Inject X-User-Id, X-User-Role headers
            end
        end
    end

    GW->>Redis: RateLimiter check (100 req/s, burst 200)
    alt Rate exceeded
        GW-->>Client: 429 Too Many Requests
    end

    GW->>Eureka: Discover target service
    Eureka-->>GW: Service instance(s)

    GW->>TargetSvc: Forward request (lb://service-name)
    TargetSvc-->>GW: Response
    GW-->>Client: Forward response
```

---

## 3. Route Configuration

```mermaid
flowchart LR
    subgraph Gateway Routes
        direction TB
        R1["/api/v1/auth/**"]
        R2["/api/v1/tokens/**"]
        R3["/api/v1/users/**"]
        R4["/api/v1/profiles/**"]
        R5["/api/v1/addresses/**"]
        R6["/api/v1/products/**"]
        R7["/api/v1/categories/**"]
        R8["/api/v1/images/**"]
        R9["/api/v1/favorites/**"]
        R10["/api/v1/search/**"]
        R11["/api/v1/suggestions/**"]
        R12["/api/v1/orders/**"]
        R13["/api/v1/seller/orders/**"]
        R14["/api/v1/payments/**"]
        R15["/api/v1/chats/**"]
        R16["/ws/**"]
        R17["/api/v1/notifications/**"]
        R18["/api/v1/reports/**"]
        R19["/api/v1/admin/**"]
        R20["/api/v1/sagas/**"]
        R21["/actuator/**"]
    end

    subgraph Services
        A[auth-service]
        U[user-service]
        P[product-service]
        S[search-service]
        O[order-service]
        Pay[payment-service]
        C[chat-service]
        N[notification-service]
        An[analytics-service]
        Saga[saga-orchestrator]
    end

    R1 --> A
    R2 --> A
    R3 --> U
    R4 --> U
    R5 --> U
    R6 --> P
    R7 --> P
    R8 --> P
    R9 --> P
    R10 --> S
    R11 --> S
    R12 --> O
    R13 --> O
    R14 --> Pay
    R15 --> C
    R16 --> C
    R17 --> N
    R18 --> An
    R19 --> An
    R20 --> Saga
```

### Route Table

| # | Route ID | Path Pattern | Target (lb://) | Auth Required |
|---|----------|-------------|----------------|:---:|
| 1 | auth-service | `/api/v1/auth/**` | auth-service | No |
| 2 | tokens | `/api/v1/tokens/**` | auth-service | No |
| 3 | user-service | `/api/v1/users/**` | user-service | Yes |
| 4 | profiles | `/api/v1/profiles/**` | user-service | Yes |
| 5 | addresses | `/api/v1/addresses/**` | user-service | Yes |
| 6 | product-service | `/api/v1/products/**` | product-service | Yes |
| 7 | categories | `/api/v1/categories/**` | product-service | No (or Yes) |
| 8 | images | `/api/v1/images/**` | product-service | Yes |
| 9 | favorites | `/api/v1/favorites/**` | product-service | Yes |
| 10 | search-service | `/api/v1/search/**` | search-service | No |
| 11 | suggestions | `/api/v1/suggestions/**` | search-service | No |
| 12 | order-service | `/api/v1/orders/**` | order-service | Yes |
| 13 | seller-orders | `/api/v1/seller/orders/**` | order-service | Yes |
| 14 | payment-service | `/api/v1/payments/**` | payment-service | Yes |
| 15 | chat-service | `/api/v1/chats/**` | chat-service | Yes |
| 16 | ws | `/ws/**` | chat-service | No |
| 17 | notification-service | `/api/v1/notifications/**` | notification-service | Yes |
| 18 | reports | `/api/v1/reports/**` | analytics-service | Yes |
| 19 | admin | `/api/v1/admin/**` | analytics-service | Yes (ADMIN) |
| 20 | saga-orchestrator | `/api/v1/sagas/**` | saga-orchestrator | Yes |
| 21 | actuator | `/actuator/**` | (gateway) | No |

---

## 4. Authentication Filter — Chi tiết

```mermaid
flowchart TD
    A[Request nhận được] --> B{Path public?}
    B -->|Yes| C[Skip filter → forward]
    B -->|No| D{Has Authorization header?}
    D -->|No| E[401 MISSING_AUTH_HEADER]
    D -->|Yes| F{Token starts with Bearer?}
    F -->|No| G[401 INVALID_AUTH_HEADER]
    F -->|Yes| H[JwtUtil.validateToken]
    H -->|Invalid/Expired| I[401 INVALID_TOKEN]
    H -->|Valid| J[Extract userId, role]
    J --> K[Inject X-User-Id, X-User-Role]
    K --> L[Forward to service]
```

### JWT Util — Xử lý

```mermaid
flowchart LR
    subgraph JwtUtil
        JT[JWT Parsing]
        V[Validation]
        E[Extraction]
    end

    JT --> V
    V --> E
    E -->|Claims| UID[userId]
    E -->|Claims| Role[role]
```

### Headers injected

| Header | Value | Mô tả |
|--------|-------|-------|
| `X-User-Id` | UUID string | ID người dùng |
| `X-User-Role` | ROLE_USER / ROLE_SELLER / ROLE_ADMIN | Vai trò |

---

## 5. Rate Limiter

```mermaid
sequenceDiagram
    participant Client
    participant GW as API Gateway
    participant Redis

    loop Mỗi request
        Client->>GW: Request
        GW->>Redis: GET rate:{clientIp}:count
        alt Count < 100
            GW->>Redis: INCR rate:{clientIp}:count (TTL 1s)
            GW->>Client: Forward to service
        else Count >= 100 (burst 200)
            GW->>Redis: Check burst key
            alt Burst < 200
                GW->>Redis: INCR burst key
                GW->>Client: Forward (burst allowed)
            else Burst exceeded
                GW-->>Client: 429 Too Many Requests
            end
        end
    end
```

| Config | Value |
|--------|-------|
| Default rate | 100 requests/second |
| Burst capacity | 200 requests |
| Redis key | `rate:{ip}:count` |
| TTL | 1 second |

---

## 6. CORS Configuration

```yaml
cors:
  allowed-origins:
    - "http://localhost:3000"   # Frontend dev
    - "http://localhost:3001"   # Frontend alt
  allowed-methods: GET, POST, PUT, DELETE, OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

---

## 7. Global Exception Handler

```mermaid
sequenceDiagram
    participant Client
    participant GW
    participant Service

    Client->>GW: Request
    GW->>Service: Forward
    Service--xGW: Error / Timeout
    GW->>GW: GlobalExceptionHandler

    alt Service timeout
        GW-->>Client: 504 Gateway Timeout
    alt Service unavailable
        GW-->>Client: 503 Service Unavailable
    alt Circuit breaker open
        GW-->>Client: 503 Circuit Breaker Open
    else Unknown error
        GW-->>Client: 500 Internal Server Error
    end
```

---

## 8. Monitoring & Observability

| Tính năng | Implementation |
|-----------|---------------|
| Metrics | Micrometer + Prometheus |
| Tracing | Spring Cloud Sleuth (Brave) |
| Logging | LoggingFilter (method, path, status, duration) |
| Health | `/actuator/health` |
| Info | `/actuator/info` |

---

## 9. Xử lý lỗi

| Tình huống | HTTP Status | Xử lý |
|------------|-------------|-------|
| Token missing | 401 | `MISSING_AUTH_HEADER` |
| Token invalid | 401 | `INVALID_TOKEN` |
| Token expired | 401 | `TOKEN_EXPIRED` |
| Rate limit exceeded | 429 | `RATE_LIMIT_EXCEEDED` |
| Service unavailable | 503 | Load balancer retry |
| CORS origin invalid | 403 | Blocked by CORS filter |
