# Bảng tổng hợp công nghệ

| **Hạng mục** | **Công nghệ** | **Phiên bản** | **Ghi chú** |
|--------------|---------------|---------------|-------------|
| **Backend Framework** | Spring Boot (Java) | 3.2.x+ (Java 21 LTS) | Sử dụng Virtual Threads (Project Loom) |
| **API Gateway** | Spring Cloud Gateway | 4.1.x+ | Rate limiting, circuit breaker (Resilience4j) |
| **Service Discovery** | Netflix Eureka (hoặc Nacos) | 2.0.x+ | Tự động đăng ký service |
| **Config Server** | Spring Cloud Config Server | 4.1.x+ | Cấu hình tập trung |
| **Database (SQL)** | PostgreSQL | 16.x | JSONB cho attribute động |
| **Search Engine** | Elasticsearch | 8.11.x+ | Full-text search, autocomplete |
| **Cache & Session** | Redis | 7.2.x (Cluster) | Session, cache, rate limiting, distributed lock |
| **Message Broker (Event)** | Apache Kafka | 3.6.x | Event sourcing, Saga |
| **Task Queue** | RabbitMQ | 3.12.x | Tác vụ ngắn, yêu cầu ACK |
| **Sync Communication** | OpenFeign + gRPC | Spring Cloud 4.1 / gRPC 1.59 | REST cho thông thường, gRPC cho hiệu suất cao |
| **Distributed Transaction** | Saga Orchestrator (Kafka) | Tự build | Duy trì nhất quán dữ liệu |
| **Frontend Framework** | Next.js (TypeScript) | 14.x+ (App Router) | SSR/SSG, SEO tốt |
| **Frontend UI Library** | React + Tailwind CSS + Shadcn/ui | React 18, Tailwind 3.4 | Components hệ thống, tùy biến cao |
| **Frontend State Management** | Zustand + TanStack Query | Zustand 4.x, TanStack 5.x | State global và server cache |
| **Mobile / PWA** | Next.js PWA + React Native | React Native 0.73 | Hỗ trợ PWA, có thể mở rộng native |
| **Containerization** | Docker | 24.x+ | Đóng gói image |
| **Orchestration** | Kubernetes (EKS/GKE/AKS) | 1.28+ | Quản lý cluster, auto-scaling |
| **Infrastructure as Code** | Terraform | 1.7.x | Quản lý cloud resources |
| **Monitoring (Metrics)** | Prometheus + Grafana | Prometheus 2.50, Grafana 10 | Thu thập và hiển thị metric |
| **Logging** | ELK Stack hoặc Loki | ELK 8.x / Loki 2.9 | Tập trung log |
| **Distributed Tracing** | Jaeger + OpenTelemetry | Jaeger 1.50 | Theo dõi request xuyên service |
| **CI/CD Pipeline** | GitHub Actions / GitLab CI | Latest | Tự động build, test, deploy |
| **Security (Auth)** | Spring Security 6 + JWT (OAuth2) | Spring Boot 3.x | Stateless, RSA256, OAuth2 |
| **Secrets Management** | HashiCorp Vault (hoặc K8s Secrets) | Vault 1.15 | Lưu trữ thông tin nhạy cảm |