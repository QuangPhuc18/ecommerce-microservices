package com.c2c.payment.service;

import com.c2c.payment.dto.PaymentCreateRequest;
import com.c2c.payment.dto.PaymentResponse;
import com.c2c.payment.messaging.producer.PaymentEventProducer;
import com.c2c.payment.model.Payment;
import com.c2c.payment.model.PaymentLog;
import com.c2c.payment.model.PaymentStatus;
import com.c2c.payment.repository.PaymentLogRepository;
import com.c2c.payment.repository.PaymentRepository;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final PaymentEventProducer paymentEventProducer;

    @Transactional
    public PaymentResponse processPayment(PaymentCreateRequest request) {
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        paymentLogRepository.save(PaymentLog.builder()
                .paymentId(payment.getId())
                .toStatus(PaymentStatus.PENDING)
                .message("Payment initiated")
                .build());

        String transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        payment.setTransactionId(transactionId);
        payment.setStatus(PaymentStatus.PROCESSING);
        payment = paymentRepository.save(payment);

        paymentLogRepository.save(PaymentLog.builder()
                .paymentId(payment.getId())
                .fromStatus(PaymentStatus.PENDING)
                .toStatus(PaymentStatus.PROCESSING)
                .message("Processing payment")
                .build());

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        paymentLogRepository.save(PaymentLog.builder()
                .paymentId(payment.getId())
                .fromStatus(PaymentStatus.PROCESSING)
                .toStatus(PaymentStatus.COMPLETED)
                .message("Payment completed")
                .build());

        paymentEventProducer.sendPaymentProcessedEvent(payment);
        log.info("Payment processed: {} for order {}", payment.getId(), payment.getOrderId());
        return toResponse(payment);
    }

    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        return toResponse(payment);
    }

    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse refundPayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "Only completed payments can be refunded");
        }

        PaymentStatus previousStatus = payment.getStatus();
        payment.setStatus(PaymentStatus.REFUNDED);
        payment = paymentRepository.save(payment);

        paymentLogRepository.save(PaymentLog.builder()
                .paymentId(payment.getId())
                .fromStatus(previousStatus)
                .toStatus(PaymentStatus.REFUNDED)
                .message("Payment refunded")
                .build());

        paymentEventProducer.sendPaymentProcessedEvent(payment);
        log.info("Payment refunded: {}", payment.getId());
        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
