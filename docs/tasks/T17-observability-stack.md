# Task T17: Thiết lập Observability (Metric, Log, Trace)

## 1. Mục tiêu
- Cài đặt các công cụ để giám sát hệ thống.

## 2. Phạm vi công việc
- [ ] Cài đặt Prometheus + Grafana trong docker-compose.
- [ ] Cấu hình Micrometer cho từng service để expose metrics (JVM, HTTP requests).
- [ ] Tạo Grafana Dashboard mẫu (JVM Memory, Request Latency, Error Rate).
- [ ] Cài đặt Loki (thay thế ELK) hoặc Elasticsearch + Kibana để tập trung log.
- [ ] Cài đặt Jaeger và gắn OpenTelemetry Agent vào từng service để trace.
- [ ] Đảm bảo traceId được truyền qua headers (sử dụng Sleuth/OpenTelemetry).

## 3. Tiêu chí nghiệm thu (DoD)
- [ ] Truy cập Grafana thấy metric của service đang chạy.
- [ ] Truy cập Kibana thấy log từ các container.
- [ ] Truy cập Jaeger UI thấy được trace của 1 request đi qua 3 service.

## 4. Ghi chú kỹ thuật
- Mọi service đều phải import dependency `micrometer-registry-prometheus`.
- Sử dụng MDC (Mapped Diagnostic Context) để inject traceId vào log.