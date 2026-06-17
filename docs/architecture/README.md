# Tài liệu Kiến trúc Hệ thống E-commerce C2C

Thư mục này chứa các tài liệu thiết kế kiến trúc cho dự án **ecommerce-microservices** (mô hình C2C, tham khảo Chợ Tốt).

## Danh sách tài liệu

| STT | Tên file | Mô tả |
|-----|----------|-------|
| 01 | `01-overview.md` | Tổng quan kiến trúc, các layer và luồng dữ liệu chính. |
| 02 | `02-backend-services.md` | Danh sách và chi tiết các microservice backend, cấu trúc thư mục mẫu. |
| 03 | `03-frontend-architecture.md` | Kiến trúc frontend Next.js, tổ chức thư mục, state management. |
| 04 | `04-database-design.md` | Thiết kế cơ sở dữ liệu cho từng service (bảng, quan hệ). |
| 05 | `05-communication.md` | Các cơ chế giao tiếp giữa các service (gRPC, Feign, Kafka, RabbitMQ, Saga). |
| 06 | `06-infrastructure.md` | Hạ tầng container, orchestration, CI/CD, Terraform. |
| 07 | `07-observability.md` | Giám sát, logging, distributed tracing (Prometheus, Grafana, ELK, Jaeger). |
| 08 | `08-technology-stack.md` | Bảng tổng hợp công nghệ sử dụng cho từng thành phần. |
| 09 | `09-security.md` | Xác thực, phân quyền, bảo mật, quản lý bí mật. |

## Cách sử dụng
- **Tổng quan hệ thống**: đọc `01-overview.md` để nắm bố cục tổng thể các layer và luồng dữ liệu.
- **Backend**: tham khảo `02-backend-services.md` để biết danh sách các microservice và cấu trúc thư mục mẫu.
- **Frontend**: xem `03-frontend-architecture.md` để hiểu tổ chức Next.js, components, state management và BFF.
- **Cơ sở dữ liệu**: `04-database-design.md` mô tả chi tiết các bảng, quan hệ cho từng service.
- **Giao tiếp giữa các service**: `05-communication.md` giải thích cách dùng gRPC, Feign, Kafka, RabbitMQ và Saga.
- **Hạ tầng**: `06-infrastructure.md` hướng dẫn về Docker, Kubernetes, Terraform và CI/CD.
- **Giám sát, log, trace**: `07-observability.md` trình bày cách cài đặt Prometheus, Grafana, ELK/Loki, Jaeger.
- **Công nghệ sử dụng**: `08-technology-stack.md` cung cấp bảng tổng hợp version và vai trò của từng thành phần.
- **Bảo mật**: `09-security.md` đề cập đến xác thực, phân quyền, JWT, Vault và các biện pháp bảo vệ.

> **Mẹo**: Khi bắt đầu làm việc với một module cụ thể, hãy đọc đồng thời các file liên quan (ví dụ: backend + communication + database để hiểu toàn bộ luồng dữ liệu).
## Liên hệ
Tài liệu này được quản lý trong repository dự án. Mọi cập nhật nên được thực hiện thông qua pull request.
## Tài liệu kiến trúc
Xem chi tiết tại [docs/architecture/README.md](docs/architecture/README.md).