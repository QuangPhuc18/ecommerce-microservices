# Task T28: Viết Kubernetes Manifests (Helm) & Terraform

## 1. Mục tiêu
- Chuẩn bị mã nguồn để deploy production lên Cloud.

## 2. Phạm vi công việc
- [ ] Viết Helm Chart tổng (`infrastructure/helm/ecommerce/`) gồm các subchart cho từng service.
- [ ] Viết file `values-dev.yaml`, `values-prod.yaml`.
- [ ] Viết Terraform (AWS/GCP):
  - Module VPC.
  - Module RDS (PostgreSQL).
  - Module ElastiCache (Redis).
  - Module EKS (Kubernetes).
  - Module OpenSearch (Elasticsearch).
- [ ] Cấu hình Ingress Controller (Nginx Ingress) với SSL Certificate.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] `terraform plan` thành công (không lỗi).
- [ ] `helm install ecommerce ./helm` thành công trên cluster dev.

## 4. Ghi chú kỹ thuật
- Dùng `cert-manager` để tự động gia hạn SSL.
- Cấu hình HPA (Horizontal Pod Autoscaler) cho các service có tải cao.