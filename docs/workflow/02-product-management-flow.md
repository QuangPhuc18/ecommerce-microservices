# 02 — Product Management Flow

## Tổng quan

Quản lý vòng đời sản phẩm: CRUD sản phẩm, danh mục, hình ảnh, và tính năng yêu thích.

**Services tham gia:**
- `api-gateway` (port 8080) — routing, JWT filter
- `product-service` (port 8003) — business logic
- `search-service` (port 8004) — đồng bộ Elasticsearch (qua Kafka)

**Database:** `product_db` PostgreSQL — `products`, `categories`, `product_images`, `product_favorites`, `boost_packages`
**Cache:** Redis — product cache
**Kafka topic:** `product.changed`

---

## 1. Tạo sản phẩm

```mermaid
sequenceDiagram
    actor Seller
    participant Gateway as API Gateway (8080)
    participant ProductSvc as product-service (8003)
    participant DB as product_db
    participant Redis
    participant Kafka

    Seller->>Gateway: POST /api/v1/products
    Note over Seller: Bearer JWT + Body

    Gateway->>Gateway: AuthFilter validate JWT
    Gateway->>ProductSvc: Forward + X-User-Id, X-User-Role

    ProductSvc->>ProductSvc: SlugGenerator.generate(title)
    ProductSvc->>DB: existsBySlug(slug)
    DB-->>ProductSvc: slug unique

    ProductSvc->>ProductSvc: CategoryService.validate(categoryId)
    ProductSvc->>DB: Map categoryId -> Category
    DB-->>ProductSvc: Category exists

    ProductSvc->>DB: INSERT INTO products (title, slug, price, sellerId,...)
    DB-->>ProductSvc: Product saved

    alt Có images
        ProductSvc->>DB: INSERT product_images[]
    end

    ProductSvc->>Redis: Cache product data
    ProductSvc->>Kafka: Publish product.changed (PRODUCT_CREATED)

    ProductSvc-->>Gateway: 201 ProductResponse
    Gateway-->>Seller: Product created
```

### Request / Response

**Request:**
```json
POST /api/v1/products
{
  "title": "iPhone 14 Pro Max 256GB",
  "description": "Mới 99%, đầy đủ phụ kiện",
  "price": 25000000,
  "currency": "VND",
  "categoryId": 1,
  "attributes": {
    "color": "Deep Purple",
    "storage": "256GB",
    "ram": "6GB"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "title": "iPhone 14 Pro Max 256GB",
  "slug": "iphone-14-pro-max-256gb",
  "status": "ACTIVE",
  "price": 25000000,
  "viewCount": 0,
  "favoriteCount": 0,
  "createdAt": "2026-07-03T08:00:00"
}
```

### Xử lý lỗi

| Lỗi | HTTP Status | ErrorCode |
|-----|-------------|-----------|
| Slug trùng (sau retry) | 409 Conflict | `SLUG_DUPLICATE` |
| Category không tồn tại | 404 Not Found | `CATEGORY_NOT_FOUND` |
| Price <= 0 | 400 Bad Request | `VALIDATION_ERROR` |
| Seller không có quyền | 403 Forbidden | `ACCESS_DENIED` |

---

## 2. Cập nhật & Xóa sản phẩm

```mermaid
sequenceDiagram
    actor Seller
    participant Gateway
    participant ProductSvc
    participant DB
    participant Kafka

    Seller->>Gateway: PUT /api/v1/products/{id}
    Gateway->>ProductSvc: Forward

    ProductSvc->>DB: findById(id)
    DB-->>ProductSvc: Product entity

    alt Seller là chủ sở hữu
        ProductSvc->>ProductSvc: Cập nhật fields (title, price, status, attributes)
        alt Title thay đổi
            ProductSvc->>ProductSvc: Tạo slug mới
        end
        ProductSvc->>DB: UPDATE products SET ...
        ProductSvc->>Kafka: publish product.changed (PRODUCT_UPDATED)
        ProductSvc-->>Seller: 200 ProductResponse
    else Không phải chủ sở hữu
        ProductSvc-->>Seller: 403 Forbidden
    end

    Note over Seller: DELETE /api/v1/products/{id}
    ProductSvc->>DB: Soft-delete (status = HIDDEN)
    ProductSvc->>Kafka: publish product.changed (PRODUCT_DELETED)
```

---

## 3. Danh mục (Category)

```mermaid
sequenceDiagram
    actor Admin
    participant Gateway
    participant ProductSvc
    participant DB

    Admin->>Gateway: POST /api/v1/categories
    ProductSvc->>DB: INSERT categories (name, slug, parentId)

    Note over Admin,DB: GET /api/v1/categories

    ProductSvc->>DB: findByParentIdIsNullOrderBySortOrder
    DB-->>ProductSvc: Root categories
    ProductSvc->>ProductSvc: Build tree (đệ quy children)
    ProductSvc-->>Admin: Category tree JSON
```

### Category tree structure

```json
[
  {
    "id": 1, "name": "Điện thoại", "slug": "dien-thoai",
    "children": [
      { "id": 2, "name": "iPhone", "slug": "iphone" },
      { "id": 3, "name": "Samsung", "slug": "samsung" }
    ]
  },
  {
    "id": 4, "name": "Thời trang", "slug": "thoi-trang",
    "children": [
      { "id": 5, "name": "Áo nam", "slug": "ao-nam" }
    ]
  }
]
```

---

## 4. Yêu thích (Favorite)

```mermaid
sequenceDiagram
    actor Buyer
    participant Gateway
    participant ProductSvc
    participant DB

    Buyer->>Gateway: POST /api/v1/favorites/{productId}
    ProductSvc->>DB: existsByProductIdAndUserId
    alt Đã favorite
        ProductSvc->>DB: DELETE favorite
        ProductSvc-->>Buyer: { favorited: false, count: N }
    else Chưa favorite
        ProductSvc->>DB: INSERT favorite
        ProductSvc-->>Buyer: { favorited: true, count: N+1 }
    end
```

---

## 5. Event Flow (product.changed)

```mermaid
flowchart LR
    subgraph product-service
        P[ProductService] -->|publish| E(product.changed)
    end
    subgraph Kafka
        E
    end
    subgraph search-service
        E --> C[ProductEventConsumer]
        C -->|PRODUCT_CREATED| I[Index in Elasticsearch]
        C -->|PRODUCT_UPDATED| U[Update document]
        C -->|PRODUCT_DELETED| D[Delete from index]
    end
    subgraph analytics-service
        E --> A[AnalyticsConsumer]
        A -->|PRODUCT_CREATED| M[incrementMetric total_products]
        A -->|PRODUCT_DELETED| M2[decrementMetric total_products]
    end
```

**Payload `product.changed`:**
```json
{
  "eventType": "PRODUCT_CREATED",
  "productId": 1,
  "title": "iPhone 14 Pro Max 256GB",
  "price": 25000000,
  "categoryId": 2,
  "sellerId": "uuid",
  "status": "ACTIVE"
}
```

---

## 6. State Machine — Product Status

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Tạo mới
    ACTIVE --> INACTIVE : Ẩn
    ACTIVE --> SOLD : Đã bán
    ACTIVE --> HIDDEN : Xóa mềm
    INACTIVE --> ACTIVE : Hiện lại
    SIDDEN
    HIDDEN --> [*]
```

| Status | Ý nghĩa |
|--------|---------|
| ACTIVE | Đang hiển thị, có thể mua |
| INACTIVE | Tạm ẩn (seller tự ẩn) |
| SOLD | Đã bán (sau khi có order) |
| HIDDEN | Xóa mềm (soft-delete) |
