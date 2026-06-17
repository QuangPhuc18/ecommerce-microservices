# E-Commerce Microservices Platform

A C2C (Customer-to-Customer) e-commerce platform built with microservices architecture.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3.2, Spring Cloud 2023 |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16, Redis 7, Elasticsearch 8 |
| Messaging | Apache Kafka, RabbitMQ |
| Infrastructure | Docker, Kubernetes, Terraform |
| Observability | Prometheus, Grafana, ELK Stack, Jaeger |

## Architecture

See [docs/architecture/](docs/architecture/) for full system design.

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ecommerce-microservices

# Build backend
cd backend
mvn clean compile
```

## Project Structure

```
ecommerce-microservices/
├── backend/          # Java Spring Boot microservices (11 services)
│   ├── parent pom.xml
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
│   └── shared-lib/
├── frontend/         # Next.js applications
│   ├── apps/web/     # Main web app
│   ├── apps/admin/   # Admin dashboard
│   └── shared/       # Shared UI, types, hooks
├── infrastructure/   # Docker, K8s, Terraform, Monitoring
└── docs/             # Architecture, tasks, API docs
```

## License

MIT
