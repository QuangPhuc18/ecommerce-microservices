# Task T27: Thiết lập CI/CD Pipeline (GitHub Actions)

## 1. Mục tiêu
- Tự động hóa build, test, và deploy.

## 2. Phạm vi công việc
- [ ] Tạo thư mục `.github/workflows/`.
- [ ] Tạo file `ci.yml`:
  - Checkout code.
  - Cache Maven/Node modules.
  - Chạy `mvn test`.
  - Chạy `npm run build`.
- [ ] Tạo file `cd-dev.yml`:
  - Build Docker image cho các service.
  - Push lên Docker Hub (hoặc AWS ECR).
  - Deploy lên K8s dev namespace.
- [ ] Tạo file `cd-prod.yml` (cần approval manual).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Khi push code lên branch `main`, pipeline tự động chạy.
- [ ] Image mới được update trên K8s cluster.

## 4. Ghi chú kỹ thuật
- Lưu trữ Secrets (Docker password, K8s kubeconfig) trong GitHub Secrets.
- Sử dụng `actions/checkout@v4`.