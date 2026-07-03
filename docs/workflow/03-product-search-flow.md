# 03 — Product Search Flow

## Tổng quan

Tìm kiếm sản phẩm full-text với filter, sorting, và pagination sử dụng Elasticsearch.

**Services tham gia:**
- `api-gateway` (port 8080) — routing
- `product-service` (port 8003) — nguồn dữ liệu gốc
- `search-service` (port 8004) — Elasticsearch search engine

**Database:** Elasticsearch index `products`
**Kafka topic:** `product.changed` (đồng bộ từ product-service)

---

## 1. Tìm kiếm sản phẩm

```mermaid
sequenceDiagram
    actor User
    participant Gateway as API Gateway (8080)
    participant SearchSvc as search-service (8004)
    participant ES as Elasticsearch

    User->>Gateway: GET /api/v1/search?query=iphone&categoryId=2&minPrice=10000000&sortBy=price&sortOrder=desc&page=0&size=20
    Gateway->>SearchSvc: Forward request

    SearchSvc->>SearchSvc: ProductSearchService.search()
    SearchSvc->>SearchSvc: Build NativeQuery

    Note over SearchSvc: Multi-match query: title^3, description
    Note over SearchSvc: Bool filter: categoryId, price range

    SearchSvc->>ES: Elasticsearch search query
    ES-->>SearchSvc: SearchHits<ProductDocument>

    SearchSvc->>SearchSvc: Map to ProductSearchResponse list
    SearchSvc-->>Gateway: 200 { content, page, totalElements, totalPages }
    Gateway-->>User: Search results
```

### Xây dựng query

```mermaid
flowchart TD
    A[SearchRequest] --> B{Build NativeQuery}
    B --> C[Multi-match Query]
    B --> D[Bool Filter]
    B --> E[Sort]
    B --> F[Pageable]

    C --> C1["title^3 (boost 3x)"]
    C --> C2["description"]

    D --> D1[categoryId filter]
    D --> D2[price range: minPrice-maxPrice]

    E --> E1[price / createdAt / viewCount]
    E --> E2[asc / desc]

    F --> F1[page = 0-based]
    F --> F2[size = 20 default]
```

### Query parameters

| Parameter | Type | Mô tả | Default |
|-----------|------|-------|---------|
| `query` | String | Từ khóa tìm kiếm | "" |
| `categoryId` | Long | Lọc theo danh mục | null |
| `minPrice` | BigDecimal | Giá thấp nhất | null |
| `maxPrice` | BigDecimal | Giá cao nhất | null |
| `sortBy` | String | price / createdAt / viewCount | createdAt |
| `sortOrder` | String | asc / desc | desc |
| `page` | int | Số trang (0-index) | 0 |
| `size` | int | Số item mỗi trang | 20 |

---

## 2. Đồng bộ Elasticsearch

```mermaid
sequenceDiagram
    participant ProductSvc as product-service
    participant Kafka
    participant SearchSvc as search-service
    participant ES as Elasticsearch

    ProductSvc->>Kafka: product.changed event

    par CREATE
        Kafka->>SearchSvc: PRODUCT_CREATED
        SearchSvc->>SearchSvc: Map ProductEvent -> ProductDocument
        SearchSvc->>ES: searchRepository.save(document)
    and UPDATE
        Kafka->>SearchSvc: PRODUCT_UPDATED
        SearchSvc->>ES: searchRepository.save(document) (overwrite)
    and DELETE
        Kafka->>SearchSvc: PRODUCT_DELETED
        SearchSvc->>ES: searchRepository.deleteById(productId)
    end
```

### Elasticsearch Document Mapping

```json
{
  "products": {
    "mappings": {
      "properties": {
        "productId":    { "type": "long" },
        "title":        { "type": "text", "analyzer": "standard" },
        "description":  { "type": "text" },
        "price":        { "type": "double" },
        "currency":     { "type": "keyword" },
        "categoryId":   { "type": "long" },
        "categoryName": { "type": "keyword" },
        "sellerId":     { "type": "keyword" },
        "sellerName":   { "type": "keyword" },
        "status":       { "type": "keyword" },
        "imageUrls":    { "type": "keyword" },
        "viewCount":    { "type": "long" },
        "favoriteCount":{ "type": "long" },
        "createdAt":    { "type": "date" },
        "updatedAt":    { "type": "date" }
      }
    }
  }
}
```

---

## 3. Kiến trúc đồng bộ

```mermaid
flowchart LR
    subgraph "Data Source"
        PS[product-service]
        PG[(PostgreSQL<br/>product_db)]
    end

    subgraph "Event Bus"
        K[Kafka<br/>topic: product.changed]
    end

    subgraph "Search Engine"
        SS[search-service]
        ES[(Elasticsearch<br/>index: products)]
    end

    PS -->|CRUD| PG
    PS -->|publish event| K
    K -->|consume| SS
    SS -->|index/update/delete| ES

    User -->|GET /api/v1/search| SS
    SS -->|NativeQuery| ES
    ES -->|SearchHits| SS
    SS -->|Response| User
```

---

## 4. Xử lý lỗi

| Tình huống | Xử lý |
|------------|-------|
| Elasticsearch down | Throw `BusinessException(SEARCH_UNAVAILABLE)` |
| Index chưa được tạo | Auto-create mapping khi save document đầu tiên |
| Query syntax error | Log error, trả về empty result |
| Event không đồng bộ kịp | Eventual consistency — tối đa vài giây |

---

## 5. Lưu ý

- Chỉ index product có `status = ACTIVE` (filter khi consumer nhận event)
- Search không cần authentication (public route)
- `title` được boost 3x so với `description`
- Suggestion API (`/api/v1/suggestions`) chưa implement — có thể dùng completion suggester của ES
