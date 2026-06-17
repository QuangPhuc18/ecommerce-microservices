# Hạ tầng (Infrastructure)

## Containerization
- Mỗi service (backend, frontend) đều có `Dockerfile` để đóng gói thành image.
- Sử dụng `docker-compose.yml` cho môi trường local, bao gồm:
  - PostgreSQL (5 databases khác nhau)
  - Redis (cache, session)
  - Kafka (với Zookeeper)
  - Elasticsearch (với Kibana)
  - Prometheus, Grafana, Loki, Jaeger (tùy chọn)

## Orchestration (Kubernetes)
- Triển khai trên Kubernetes (EKS/GKE/AKS) với các thành phần:
  - **Deployment** và **Service** cho mỗi microservice.
  - **Ingress** với Nginx Ingress Controller và SSL certificate (cert-manager).
  - **ConfigMap** và **Secrets** cho cấu hình.
  - **Horizontal Pod Autoscaler (HPA)** cho các service có tải cao.
  - **PersistentVolumeClaim** cho database (nếu chạy trong cluster) – nhưng thường dùng RDS bên ngoài.

## Infrastructure as Code (Terraform)
- Quản lý tài nguyên cloud (AWS) bằng Terraform:
  - VPC, subnet, security groups.
  - RDS (PostgreSQL) instances.
  - ElastiCache (Redis) cluster.
  - EKS cluster.
  - OpenSearch (Elasticsearch) service.

## CI/CD (GitHub Actions)
- Workflow `ci.yml`: Chạy test, build code.
- Workflow `cd-dev.yml`: Build Docker image, push lên registry, deploy lên K8s dev namespace.
- Workflow `cd-prod.yml`: Tương tự nhưng yêu cầu approval thủ công và deploy lên prod namespace.
- Sử dụng GitHub Secrets để lưu thông tin nhạy cảm (registry credentials, K8s config).

## Scripts
- `infrastructure/scripts/build.sh`: Build tất cả các service.
- `infrastructure/scripts/deploy.sh`: Deploy lên K8s.
- `infrastructure/scripts/migrate.sh`: Chạy migration database.
- `infrastructure/scripts/seed-data.sh`: Tạo dữ liệu mẫu.