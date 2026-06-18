package com.c2c.notification.messaging.consumer;

import com.c2c.notification.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.changed", groupId = "notification-service-group")
    public void handleOrderEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.has("eventType") ? event.get("eventType").asText() : "";

            if (event.has("buyerId")) {
                UUID userId = UUID.fromString(event.get("buyerId").asText());
                Map<String, Object> data = new HashMap<>();
                data.put("orderNumber", event.has("orderNumber") ? event.get("orderNumber").asText() : "");
                data.put("totalAmount", event.has("totalAmount") ? event.get("totalAmount").asText() : "0");
                data.put("currency", "VND");

                notificationService.sendOrderConfirmation(userId, "", data);
                log.info("Order notification sent for user: {}", userId);
            }
        } catch (Exception e) {
            log.error("Failed to process order event for notification", e);
        }
    }

    @KafkaListener(topics = "payment.changed", groupId = "notification-service-group")
    public void handlePaymentEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            log.info("Payment event received for notification: {}", event);
        } catch (Exception e) {
            log.error("Failed to process payment event for notification", e);
        }
    }
}
