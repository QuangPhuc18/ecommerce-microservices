package com.c2c.payment.util;

import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;

import java.math.BigDecimal;

public class PaymentValidator {

    public static void validateDeposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Deposit amount must be positive");
        }
        if (amount.compareTo(new BigDecimal("100000000")) > 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Deposit amount exceeds maximum (100,000,000)");
        }
    }

    public static void validateWithdraw(BigDecimal amount, BigDecimal currentBalance) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Withdraw amount must be positive");
        }
        if (amount.compareTo(currentBalance) > 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, "Insufficient balance");
        }
    }

    public static void validatePayment(BigDecimal amount, BigDecimal currentBalance) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Payment amount must be positive");
        }
        if (amount.compareTo(currentBalance) > 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, "Insufficient balance");
        }
    }
}
