# 08 — Analytics & Reporting Flow

## Tổng quan

Thống kê dashboard, quản lý báo cáo vi phạm, và ghi log hoạt động admin.

**Services tham gia:**
- `api-gateway` (port 8080) — routing, JWT + role check
- `analytics-service` (port 8009) — business logic
- `order-service` (port 8005) — source event
- `product-service` (port 8003) — source event

**Database:** `analytics_db` PostgreSQL — `dashboard_metrics`, `system_reports`, `admin_logs`
**Kafka topics:** `order.changed`, `product.changed`

---

## 1. Dashboard Statistics

```mermaid
sequenceDiagram
    actor Admin
    participant Gateway as API Gateway
    participant AnalyticsSvc as analytics-service (8009)
    participant DB as analytics_db

    Admin->>Gateway: GET /api/v1/admin/statistics
    Note over Admin: Yêu cầu ROLE_ADMIN

    Gateway->>Gateway: Check X-User-Role == ROLE_ADMIN
    Gateway->>AnalyticsSvc: Forward

    AnalyticsSvc->>DB: findAll dashboard_metrics
    DB-->>AnalyticsSvc: List<DashboardMetric>

    AnalyticsSvc->>AnalyticsSvc: Build statistics response
    AnalyticsSvc-->>Admin: Dashboard statistics JSON
```

### Response

```json
{
  "totalUsers": 1500,
  "totalProducts": 8500,
  "totalOrders": 3200,
  "totalRevenue": 125000000000,
  "pendingReports": 12,
  "resolvedReports": 98,
  "lastUpdated": "2026-07-03T08:00:00"
}
```

---

## 2. Cập nhật metrics (Event-driven)

```mermaid
sequenceDiagram
    participant OrderSvc as order-service
    participant ProductSvc as product-service
    participant Kafka
    participant AnalyticsSvc as analytics-service
    participant DB

    OrderSvc->>Kafka: order.changed (ORDER_CREATED)
    ProductSvc->>Kafka: product.changed (PRODUCT_CREATED)

    par Order events
        Kafka->>AnalyticsSvc: ORDER_CREATED
        AnalyticsSvc->>DB: incrementMetric("total_orders")
        AnalyticsSvc->>DB: incrementMetric("total_revenue", amount)
    and Product events
        Kafka->>AnalyticsSvc: PRODUCT_CREATED
        AnalyticsSvc->>DB: incrementMetric("total_products")
    end
```

### DashboardMetric Table

| Column | Type | Mô tả |
|--------|------|-------|
| metric_key | VARCHAR (PK) | "total_users", "total_products", "total_orders", "total_revenue" |
| metric_value | BIGINT | Giá trị hiện tại |
| updated_at | TIMESTAMP | |

---

## 3. Báo cáo vi phạm (System Report)

```mermaid
sequenceDiagram
    actor User
    participant Gateway
    participant AnalyticsSvc as analytics-service
    participant DB

    Note over User: Tạo report
    User->>Gateway: POST /api/v1/reports
    Note over User: { productId, reason: "SPAM", description: "..." }

    AnalyticsSvc->>DB: INSERT system_reports (status = PENDING)
    DB-->>AnalyticsSvc: Saved
    AnalyticsSvc-->>User: 201 ReportResponse

    Note over User: Xem danh sách report
    User->>Gateway: GET /api/v1/reports?status=PENDING
    AnalyticsSvc->>DB: findByStatus(PENDING)
    AnalyticsSvc-->>User: List<SystemReport>

    Note over Admin: Xử lý report
    Admin->>Gateway: PUT /api/v1/reports/{id}/resolve
    AnalyticsSvc->>DB: UPDATE status = RESOLVED
    AnalyticsSvc->>DB: INSERT admin_log
    AnalyticsSvc-->>Admin: 200
```

### SystemReport Status

| Status | Mô tả |
|--------|-------|
| PENDING | Chờ xử lý |
| RESOLVED | Đã giải quyết |

---

## 4. Admin Log

```mermaid
sequenceDiagram
    actor Admin
    participant Gateway
    participant AnalyticsSvc as analytics-service
    participant DB

    Note over Admin: GET /api/v1/admin/logs?page=0&size=50

    Admin->>Gateway: Request
    Gateway->>AnalyticsSvc: Forward (X-User-Role = ADMIN)

    AnalyticsSvc->>DB: findAllByOrderByCreatedAtDesc(pageable)
    DB-->>AnalyticsSvc: Page<AdminLog>

    AnalyticsSvc-->>Admin: Paginated admin logs
```

### AdminLog Table

| Column | Type | Mô tả |
|--------|------|-------|
| id | UUID (PK) | |
| admin_id | UUID | Admin thực hiện |
| action | VARCHAR | RESOLVE_REPORT, DELETE_PRODUCT, BAN_USER |
| entity_type | VARCHAR | report, product, user |
| entity_id | VARCHAR | |
| details | TEXT | JSON chi tiết |
| ip_address | VARCHAR | |
| created_at | TIMESTAMP | |

---

## 5. Event Flow

```mermaid
flowchart LR
    subgraph Sources
        O[order.changed]
        P[product.changed]
    end

    subgraph Kafka
        O
        P
    end

    subgraph analytics-service
        AC[AnalyticsConsumer]
        AS[AnalyticsService]
        DB[(analytics_db)]
    end

    O --> AC
    P --> AC
    AC --> AS
    AS --> DB
```

---

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Metric key không tồn tại | Tự động tạo mới với @Query(native) |
| Report trùng product-user | Cho phép nhiều report (mỗi user chỉ 1) |
| Admin không có quyền | 403 FORBIDDEN |
| DB insert fail | Rollback, log error |
