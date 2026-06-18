package com.c2c.payment.controller;

import com.c2c.payment.dto.*;
import com.c2c.payment.service.PaymentService;
import com.c2c.payment.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final WalletService walletService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.processPayment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable UUID orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }

    @GetMapping("/wallet")
    public ResponseEntity<WalletResponse> getWallet(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(walletService.getBalance(userId));
    }

    @PostMapping("/wallet")
    public ResponseEntity<WalletResponse> createWallet(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(walletService.createWallet(userId, "VND"));
    }

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(Authentication authentication,
                                                        @Valid @RequestBody DepositRequest request,
                                                        HttpServletRequest httpRequest) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(walletService.deposit(userId, request, httpRequest));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(Authentication authentication,
                                                         @Valid @RequestBody WithdrawRequest request,
                                                         HttpServletRequest httpRequest) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(walletService.withdraw(userId, request, httpRequest));
    }

    @PostMapping("/hold")
    public ResponseEntity<TransactionResponse> holdPayment(Authentication authentication,
                                                            @Valid @RequestBody HoldReleaseRequest request) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(walletService.holdPayment(userId, request));
    }

    @PostMapping("/release")
    public ResponseEntity<TransactionResponse> releasePayment(Authentication authentication,
                                                               @Valid @RequestBody HoldReleaseRequest request) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(walletService.releasePayment(userId, request));
    }

    private UUID extractUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }
}
