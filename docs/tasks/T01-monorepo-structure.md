# Task T01: Thiết lập Monorepo & Cấu trúc dự án

## 1. Mục tiêu
- Tạo cây thư mục gốc cho toàn bộ hệ thống.
- Thiết lập các file cấu hình gốc (Root).

## 2. Phạm vi công việc
- [ ] Tạo thư mục root: `ecommerce-microservices/`.
- [ ] Tạo các thư mục con: `backend/`, `frontend/`, `infrastructure/`, `docs/`.
- [ ] Tạo file `README.md` tổng quan dự án.
- [ ] Tạo file `.gitignore` (bao gồm Java, Node, Docker, IDE).
- [ ] Tạo file `pom.xml` (Parent POM) ở root để quản lý dependency chung (Spring Boot Starter Parent, Spring Cloud version).
- [ ] Tạo file `.editorconfig` để đồng bộ coding style.

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Cấu trúc thư mục đúng với thiết kế kiến trúc đã duyệt.
- [ ] Mọi thành viên clone project về đều nhìn thấy cấu trúc chung.
- [ ] Parent POM compile thành công (`mvn clean compile`).

## 4. Ghi chú kỹ thuật
- Sử dụng Spring Boot 3.2.x, Java 21.
- Quản lý version tập trung tại `<properties>` trong Parent POM.