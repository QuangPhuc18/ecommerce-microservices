package com.c2c.chat.service;

import com.c2c.chat.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String UNREAD_PREFIX = "chat:unread:";

    public void sendMessage(String conversationId, MessageResponse message) {
        String destination = "/topic/conversations/" + conversationId;
        messagingTemplate.convertAndSend(destination, message);
        log.info("WebSocket message sent to {}: {}", destination, message.getId());
    }

    public void sendUnreadCount(String userId, int count) {
        String destination = "/topic/users/" + userId + "/unread";
        messagingTemplate.convertAndSend(destination, count);
    }

    public void cacheUnreadCount(String userId, int count) {
        redisTemplate.opsForValue().set(UNREAD_PREFIX + userId, count);
    }

    public int getCachedUnreadCount(String userId) {
        Object val = redisTemplate.opsForValue().get(UNREAD_PREFIX + userId);
        return val instanceof Integer ? (Integer) val : 0;
    }
}
