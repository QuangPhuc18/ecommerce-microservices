package com.example.notification_service.service;

import com.example.notification_service.entity.Notification;
import com.example.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification createAndSendNotification(Long userId, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);

        // Push to client via WebSocket if they are online
        // Destination format: /topic/notifications/{userId}
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);

        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notif -> {
            notif.setIsRead(true);
            notificationRepository.save(notif);
        });
    }

    public int getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
