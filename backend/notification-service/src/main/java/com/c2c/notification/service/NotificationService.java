package com.c2c.notification.service;

import com.c2c.notification.model.Notification;
import com.c2c.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushNotificationService;

    public void sendOrderConfirmation(UUID userId, String email, Map<String, Object> data) {
        saveNotification(userId, "ORDER_CONFIRMED", "Order Confirmed", "Your order has been confirmed", "EMAIL");
        emailService.sendOrderConfirmation(email, data);
    }

    public void sendPaymentReceived(UUID userId, String email, Map<String, Object> data) {
        saveNotification(userId, "PAYMENT_RECEIVED", "Payment Received", "Payment received successfully", "EMAIL");
        emailService.sendPaymentReceived(email, data);
    }

    public void sendWelcome(UUID userId, String email, Map<String, Object> data) {
        saveNotification(userId, "WELCOME", "Welcome", "Welcome to our marketplace", "EMAIL");
        emailService.sendWelcomeEmail(email, data);
    }

    public void sendSmsNotification(UUID userId, String phone, String message) {
        saveNotification(userId, "SMS", "SMS Notification", message, "SMS");
        smsService.sendSms(phone, message);
    }

    public void sendPushNotification(UUID userId, String deviceToken, String title, String body) {
        saveNotification(userId, "PUSH", title, body, "PUSH");
        pushNotificationService.sendPush(deviceToken, title, body, Map.of());
    }

    public Page<Notification> getUserNotifications(UUID userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public int getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    private Notification saveNotification(UUID userId, String type, String title, String body, String channel) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .channel(channel)
                .sentAt(LocalDateTime.now())
                .build();
        notification = notificationRepository.save(notification);
        log.info("Notification saved: userId={}, type={}, channel={}", userId, type, channel);
        return notification;
    }
}
