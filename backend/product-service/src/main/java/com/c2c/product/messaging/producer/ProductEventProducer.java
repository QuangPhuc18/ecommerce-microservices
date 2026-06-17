package com.c2c.product.messaging.producer;

import com.c2c.product.model.Product;
import com.c2c.shared.event.ProductEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendProductChanged(Product product, String eventType) {
        ProductEvent event = ProductEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .productId(product.getId())
                .productName(product.getTitle())
                .price(product.getPrice())
                .status(product.getStatus().name())
                .timestamp(LocalDateTime.now())
                .build();
        kafkaTemplate.send("product.changed", event);
    }
}
