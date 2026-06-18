package com.example.chat_service.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import com.example.chat_service.config.RabbitMQConfig;

@Component
@Slf4j
public class ChatNotificationListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handleChatNotification(String message) {
        log.info("Received chat notification message: {}", message);
        // Future: integrate with a push notification service or FCM
    }
}
