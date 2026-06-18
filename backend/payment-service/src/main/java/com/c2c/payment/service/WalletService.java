package com.c2c.payment.service;

import com.c2c.payment.dto.*;
import com.c2c.payment.model.*;
import com.c2c.payment.repository.*;
import com.c2c.payment.util.PaymentValidator;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AuditTrailRepository auditTrailRepository;

    public WalletResponse getBalance(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Wallet not found"));
        return toWalletResponse(wallet);
    }

    @Transactional
    public WalletResponse createWallet(UUID userId, String currency) {
        if (walletRepository.existsByUserId(userId)) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS, "Wallet already exists for this user");
        }
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .currency(currency != null ? currency : "VND")
                .build();
        wallet = walletRepository.save(wallet);
        log.info("Wallet created for user: {}", userId);
        return toWalletResponse(wallet);
    }

    @Transactional
    public TransactionResponse deposit(UUID userId, DepositRequest request, HttpServletRequest httpRequest) {
        PaymentValidator.validateDeposit(request.getAmount());
        String currency = request.getCurrency() != null ? request.getCurrency() : "VND";

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .userId(userId)
                            .balance(BigDecimal.ZERO)
                            .currency(currency)
                            .build();
                    return walletRepository.save(newWallet);
                });

        BigDecimal before = wallet.getBalance();
        wallet.setBalance(before.add(request.getAmount()));
        wallet = walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .walletId(wallet.getId())
                .userId(userId)
                .type(TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .reference(request.getReference())
                .status(TransactionStatus.COMPLETED)
                .description("Deposit: " + request.getAmount() + " " + currency)
                .build();
        tx = transactionRepository.save(tx);

        auditTrailRepository.save(AuditTrail.builder()
                .userId(userId)
                .transactionId(tx.getId())
                .action("DEPOSIT")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .ipAddress(httpRequest != null ? httpRequest.getRemoteAddr() : null)
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .description("Wallet deposit")
                .build());

        log.info("Deposit completed: user={}, amount={}", userId, request.getAmount());
        return toTransactionResponse(tx);
    }

    @Transactional
    public TransactionResponse withdraw(UUID userId, WithdrawRequest request, HttpServletRequest httpRequest) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Wallet not found"));

        PaymentValidator.validateWithdraw(request.getAmount(), wallet.getBalance());

        BigDecimal before = wallet.getBalance();
        wallet.setBalance(before.subtract(request.getAmount()));
        wallet = walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .walletId(wallet.getId())
                .userId(userId)
                .type(TransactionType.WITHDRAW)
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .reference(request.getReference())
                .status(TransactionStatus.COMPLETED)
                .description("Withdraw: " + request.getAmount())
                .build();
        tx = transactionRepository.save(tx);

        auditTrailRepository.save(AuditTrail.builder()
                .userId(userId)
                .transactionId(tx.getId())
                .action("WITHDRAW")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .ipAddress(httpRequest != null ? httpRequest.getRemoteAddr() : null)
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .description("Wallet withdrawal")
                .build());

        log.info("Withdraw completed: user={}, amount={}", userId, request.getAmount());
        return toTransactionResponse(tx);
    }

    @Transactional
    public TransactionResponse holdPayment(UUID userId, HoldReleaseRequest request) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Wallet not found"));

        PaymentValidator.validatePayment(request.getAmount(), wallet.getBalance());

        BigDecimal before = wallet.getBalance();
        wallet.setBalance(before.subtract(request.getAmount()));
        wallet = walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .walletId(wallet.getId())
                .userId(userId)
                .type(TransactionType.HOLD)
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .orderId(request.getOrderId())
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Hold for order " + request.getOrderId())
                .build();
        tx = transactionRepository.save(tx);

        auditTrailRepository.save(AuditTrail.builder()
                .userId(userId)
                .transactionId(tx.getId())
                .action("PAYMENT_HOLD")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .description("Payment hold for order: " + request.getOrderId())
                .build());

        log.info("Payment held: user={}, amount={}, order={}", userId, request.getAmount(), request.getOrderId());
        return toTransactionResponse(tx);
    }

    @Transactional
    public TransactionResponse releasePayment(UUID userId, HoldReleaseRequest request) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Wallet not found"));

        BigDecimal before = wallet.getBalance();
        wallet.setBalance(before.add(request.getAmount()));
        wallet = walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .walletId(wallet.getId())
                .userId(userId)
                .type(TransactionType.RELEASE)
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .orderId(request.getOrderId())
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Release hold for order " + request.getOrderId())
                .build();
        tx = transactionRepository.save(tx);

        auditTrailRepository.save(AuditTrail.builder()
                .userId(userId)
                .transactionId(tx.getId())
                .action("PAYMENT_RELEASE")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(wallet.getBalance())
                .description("Payment release for order: " + request.getOrderId())
                .build());

        log.info("Payment released: user={}, amount={}, order={}", userId, request.getAmount(), request.getOrderId());
        return toTransactionResponse(tx);
    }

    private WalletResponse toWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    private TransactionResponse toTransactionResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .walletId(tx.getWalletId())
                .userId(tx.getUserId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .orderId(tx.getOrderId())
                .reference(tx.getReference())
                .status(tx.getStatus())
                .description(tx.getDescription())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
