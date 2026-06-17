package com.c2c.auth.messaging.producer;

import com.c2c.auth.model.User;
import com.c2c.shared.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendUserCreatedEvent(User user) {
        var event = java.util.Map.of(
            "eventId", java.util.UUID.randomUUID().toString(),
            "eventType", "USER_CREATED",
            "userId", user.getId().toString(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole().name(),
            "timestamp", java.time.LocalDateTime.now().toString()
        );
        String json = JsonUtils.toJson(event);
        kafkaTemplate.send("user.registered", user.getId().toString(), json);
        log.info("Published UserCreatedEvent for user: {}", user.getEmail());
    }
}
