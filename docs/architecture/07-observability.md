# Giám sát, Logging và Tracing

## Metrics (Prometheus + Grafana)
- Mỗi service expose metric tại `/actuator/prometheus` nhờ Spring Boot Actuator và Micrometer.
- Prometheus thu thập metric, Grafana hiển thị dashboard.
- Các dashboard quan trọng:
  - JVM (memory, GC, threads).
  - HTTP request (latency, error rate, throughput).
  - Business metrics (số đơn hàng, doanh thu).

## Logging (ELK Stack hoặc Loki)
- **ELK Stack**: Elasticsearch + Logstash + Kibana.
  - Logstash thu thập log từ file hoặc stdout, gửi vào Elasticsearch.
  - Kibana cho phép tìm kiếm và phân tích log.
- **Loki** (alternative): nhẹ hơn, tích hợp với Grafana.

## Distributed Tracing (Jaeger + OpenTelemetry)
- Mỗi service tích hợp OpenTelemetry agent để gửi trace đến Jaeger.
- Mỗi request được gán một `traceId` và `spanId` qua headers.
- Jaeger UI hiển thị waterfall view để xác định bottleneck.

## Alerting
- Cấu hình alert rules trong Prometheus (ví dụ: CPU > 80%, error rate > 5%).
- Gửi thông báo qua Slack/Email thông qua Alertmanager.