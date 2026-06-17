package com.c2c.search.messaging.consumer;

import com.c2c.search.document.ProductDocument;
import com.c2c.search.service.ProductSearchService;
import com.c2c.shared.event.ProductEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventConsumer {

    private final ProductSearchService searchService;

    @KafkaListener(topics = "product.changed", groupId = "search-service-group")
    public void handleProductEvent(ProductEvent event) {
        log.info("Received product event: {} - {}", event.getEventType(), event.getProductId());

        switch (event.getEventType().toUpperCase()) {
            case "CREATE":
            case "UPDATE":
                ProductDocument doc = mapToDocument(event);
                searchService.indexProduct(doc);
                break;
            case "DELETE":
                searchService.deleteProduct(String.valueOf(event.getProductId()));
                break;
            default:
                log.warn("Unknown event type: {}", event.getEventType());
        }
    }

    private ProductDocument mapToDocument(ProductEvent event) {
        return ProductDocument.builder()
                .id(String.valueOf(event.getProductId()))
                .productId(event.getProductId())
                .title(event.getProductName())
                .price(event.getPrice() != null ? event.getPrice().doubleValue() : null)
                .sellerId(event.getSellerId())
                .sellerName(event.getSellerName())
                .status(event.getStatus())
                .createdAt(event.getTimestamp())
                .updatedAt(event.getTimestamp())
                .build();
    }
}
