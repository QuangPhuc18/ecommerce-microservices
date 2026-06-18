package com.c2c.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${notification.sms.provider:twilio}")
    private String smsProvider;

    public void sendSms(String phoneNumber, String message) {
        switch (smsProvider) {
            case "twilio" -> sendTwilioSms(phoneNumber, message);
            default -> log.warn("No SMS provider configured. Skipping SMS to: {}", phoneNumber);
        }
    }

    private void sendTwilioSms(String phoneNumber, String message) {
        log.info("Simulating Twilio SMS to {}: {}", phoneNumber, message);
    }

    public void sendOtp(String phoneNumber, String otpCode) {
        sendSms(phoneNumber, "Your verification code is: " + otpCode);
    }
}
