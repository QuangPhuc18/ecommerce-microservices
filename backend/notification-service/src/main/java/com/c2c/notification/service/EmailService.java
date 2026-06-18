package com.c2c.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent to: {}, subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}, subject: {}", to, subject, e);
            throw new RuntimeException("Email sending failed", e);
        }
    }

    public void sendOrderConfirmation(String to, Map<String, Object> variables) {
        sendEmail(to, "Order Confirmation", "email/order-confirmation", variables);
    }

    public void sendPaymentReceived(String to, Map<String, Object> variables) {
        sendEmail(to, "Payment Received", "email/payment-received", variables);
    }

    public void sendWelcomeEmail(String to, Map<String, Object> variables) {
        sendEmail(to, "Welcome to C2C Marketplace", "email/welcome", variables);
    }
}
