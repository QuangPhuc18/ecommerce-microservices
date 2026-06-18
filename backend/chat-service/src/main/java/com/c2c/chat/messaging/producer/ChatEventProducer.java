package com.c2c.chat.messaging.producer;

import com.c2c.chat.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendMessageSentEvent(MessageResponse message) {
        kafkaTemplate.send("chat.message.sent", message.getConversationId().toString(), message);
        log.info("Chat message event sent: {}", message.getId());
    }
}
