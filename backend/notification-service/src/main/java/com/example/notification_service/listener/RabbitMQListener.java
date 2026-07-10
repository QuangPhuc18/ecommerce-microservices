package com.example.notification_service.listener;

import com.example.notification_service.config.RabbitMQConfig;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
@RequiredArgsConstructor
public class RabbitMQListener {

    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    // Pattern to extract userId from message like "User 1 sent message to User 2 in room 3"
    private final Pattern pattern = Pattern.compile("User \\d+ sent message to User (\\d+) in room \\d+");

    @RabbitListener(queues = RabbitMQConfig.CHAT_QUEUE)
    public void receiveChatNotification(String message) {
        log.info("Received chat notification: {}", message);
        
        // Định dạng mới: CHAT|senderId|receiverId|roomId|content
        if (message != null && message.startsWith("CHAT|")) {
            String[] parts = message.split("\\|", 5);
            if (parts.length >= 5) {
                try {
                    Long senderId = Long.parseLong(parts[1]);
                    Long receiverId = Long.parseLong(parts[2]);
                    String content = parts[4];
                    
                    // Fetch sender name
                    String senderName = "Người dùng";
                    try {
                        Map<String, Object> user = restTemplate.getForObject("http://user-service/users/" + senderId, Map.class);
                        if (user != null && user.get("name") != null) {
                            senderName = (String) user.get("name");
                        }
                    } catch (Exception e) {
                        log.error("Failed to fetch sender details", e);
                    }
                    
                    // Truncate content if too long
                    if (content.length() > 50) {
                        content = content.substring(0, 50) + "...";
                    }
                    
                    String displayMessage = senderName + " đã nhắn tin: " + content;
                    notificationService.createAndSendNotification(receiverId, displayMessage, "CHAT");
                } catch (NumberFormatException e) {
                    log.error("Failed to parse CHAT message numbers: {}", message);
                }
            }
            return;
        }
        
        Matcher matcher = pattern.matcher(message);
        if (matcher.find()) {
            Long receiverId = Long.parseLong(matcher.group(1));
            notificationService.createAndSendNotification(receiverId, message, "CHAT");
        } else {
            log.warn("Could not parse receiverId from message: {}", message);
            // Fallback to a system notification or admin
            notificationService.createAndSendNotification(1L, message, "SYSTEM");
        }
    }
}
