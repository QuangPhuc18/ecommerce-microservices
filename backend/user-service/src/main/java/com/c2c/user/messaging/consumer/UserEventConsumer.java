package com.c2c.user.messaging.consumer;

import com.c2c.user.service.ProfileService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {
    private final ProfileService profileService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.registered", groupId = "user-service")
    public void handleUserRegistered(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            UUID userId = UUID.fromString(json.get("userId").asText());
            String fullName = json.has("fullName") ? json.get("fullName").asText() : null;
            profileService.createDefaultProfile(userId, fullName);
            log.info("Created default profile for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to process user.registered event: {}", message, e);
        }
    }
}
