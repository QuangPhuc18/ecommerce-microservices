package com.c2c.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class PushNotificationService {

    public void sendPush(String deviceToken, String title, String body, Map<String, String> data) {
        log.info("Simulating push notification to device {}: title={}, body={}", deviceToken, title, body);
    }

    public void sendToTopic(String topic, String title, String body, Map<String, String> data) {
        log.info("Simulating push notification to topic {}: title={}, body={}", topic, title, body);
    }
}
