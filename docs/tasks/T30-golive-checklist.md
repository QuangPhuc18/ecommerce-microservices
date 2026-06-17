# Task T30: Go-Live Checklist & Tài liệu cuối cùng

## 1. Mục tiêu
- Chuẩn bị mọi thứ để lên production.

## 2. Phạm vi công việc
- [ ] Review bảo mật:
  - Check JWT Secret không để hardcode.
  - Check CORS chỉ cho phép domain chính.
  - Kiểm tra SQL Injection (dùng Prepared Statement).
- [ ] Viết tài liệu vận hành:
  - Cách restart service.
  - Cách rollback version (helm rollback).
  - Cách scale service (kubectl scale).
- [ ] Kiểm tra Zero-downtime deployment (RollingUpdate strategy).
- [ ] Kiểm tra Backup/Restore Database.
- [ ] Tạo tài liệu API cuối cùng bằng Swagger (Springdoc OpenAPI) và export file `openapi.yaml`.
- [ ] Tạo file `README.md` tổng thể hướng dẫn setup từ A-Z.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Domain chính (https://chotot-clone.com) truy cập được.
- [ ] Admin có thể login và quản lý.
- [ ] Người dùng có thể mua hàng và chat thành công.

## 4. Ghi chú kỹ thuật
- Đây là bước cuối cùng, yêu cầu mọi thành viên review.
- Chuẩn bị kịch bản Disaster Recovery (DR).