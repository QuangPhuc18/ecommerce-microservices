package com.example.notification_service.listener;

import com.example.notification_service.config.RabbitMQConfig;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProductEventListener {

    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    @RabbitListener(queues = RabbitMQConfig.PRODUCT_QUEUE)
    public void handleProductCreated(Map<String, Object> product) {
        try {
            Long sellerId = null;
            if (product.get("sellerId") instanceof Integer) {
                sellerId = ((Integer) product.get("sellerId")).longValue();
            } else if (product.get("sellerId") instanceof Long) {
                sellerId = (Long) product.get("sellerId");
            }
            
            String productName = (String) product.get("name");
            Long productId = null;
            if (product.get("id") instanceof Integer) {
                productId = ((Integer) product.get("id")).longValue();
            } else if (product.get("id") instanceof Long) {
                productId = (Long) product.get("id");
            }

            if (sellerId != null && productId != null) {
                // Get followers
                String url = "http://USER-SERVICE/follows/followers/" + sellerId;
                ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                );

                List<Map<String, Object>> followers = response.getBody();
                if (followers != null && !followers.isEmpty()) {
                    for (Map<String, Object> follower : followers) {
                        Long followerId = null;
                        if (follower.get("followerId") instanceof Integer) {
                            followerId = ((Integer) follower.get("followerId")).longValue();
                        } else if (follower.get("followerId") instanceof Long) {
                            followerId = (Long) follower.get("followerId");
                        }
                        
                        if (followerId != null) {
                            String message = "Người bán bạn theo dõi đã đăng sản phẩm mới: " + productName;
                            notificationService.createAndSendNotification(followerId, message, "NEW_PRODUCT");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý sự kiện sản phẩm: " + e.getMessage());
        }
    }
}
