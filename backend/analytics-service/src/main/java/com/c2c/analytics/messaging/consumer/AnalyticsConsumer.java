package com.c2c.analytics.messaging.consumer;

import com.c2c.analytics.service.AnalyticsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsConsumer {

    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.changed", groupId = "analytics-service-group")
    public void handleOrderEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.has("eventType") ? event.get("eventType").asText() : "";

            if ("ORDER_CREATED".equals(eventType) || event.has("orderId")) {
                analyticsService.incrementMetric("total_orders", 1);

                if (event.has("totalAmount")) {
                    analyticsService.incrementMetric("total_revenue", event.get("totalAmount").asLong());
                }
                log.info("Analytics updated from order event");
            }
        } catch (Exception e) {
            log.error("Failed to process order event for analytics", e);
        }
    }

    @KafkaListener(topics = "product.changed", groupId = "analytics-service-group")
    public void handleProductEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.has("eventType") ? event.get("eventType").asText() : "";

            if ("PRODUCT_CREATED".equals(eventType)) {
                analyticsService.incrementMetric("total_products", 1);
                log.info("Analytics updated from product event");
            }
        } catch (Exception e) {
            log.error("Failed to process product event for analytics", e);
        }
    }
}
