package com.example.notification_service.listener;

import com.example.notification_service.config.RabbitMQConfig;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
@RequiredArgsConstructor
public class RabbitMQListener {

    private final NotificationService notificationService;

    // Pattern to extract userId from message like "User 1 sent message to User 2 in room 3"
    private final Pattern pattern = Pattern.compile("User \\d+ sent message to User (\\d+) in room \\d+");

    @RabbitListener(queues = RabbitMQConfig.CHAT_QUEUE)
    public void receiveChatNotification(String message) {
        log.info("Received chat notification: {}", message);
        
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
