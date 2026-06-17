# T01: Monorepo Structure Design

## Context
Thiết lập cây thư mục gốc và các file cấu hình cho toàn bộ hệ thống ecommerce-microservices.

## Directory Structure
```
ecommerce-microservices/
├── backend/
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── search-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── chat-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── saga-orchestrator/
│   ├── admin-service/
│   ├── api-gateway/
│   ├── discovery-service/
│   ├── config-server/
│   ├── shared-lib/
│   └── pom.xml
├── frontend/
│   ├── apps/
│   │   ├── web/
│   │   └── admin/
│   └── shared/
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   ├── helm/
│   ├── terraform/
│   ├── monitoring/
│   └── scripts/
├── docs/
│   ├── architecture/
│   └── tasks/
├── .gitignore
├── .editorconfig
└── README.md
```

## Root Config Files

- **pom.xml**: Parent POM, Spring Boot 3.2.x, Java 21, Spring Cloud 2023.0.x
- **.gitignore**: target/, *.class, *.jar, node_modules/, .idea/, *.iml, .vscode/, .DS_Store, docker volumes
- **.editorconfig**: indent_style=space, indent_size=2, charset=utf-8, end_of_line=lf, trim_trailing_whitespace=true
- **README.md**: Project overview, tech stack, local setup guide

## Acceptance Criteria
- [ ] Cấu trúc thư mục đúng kiến trúc
- [ ] Mọi member clone về đều thấy cấu trúc chung
- [ ] Parent POM compile thành công (`mvn clean compile`)
