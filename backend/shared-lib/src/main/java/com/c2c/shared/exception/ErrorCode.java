package com.c2c.shared.exception;

public enum ErrorCode {
    // Auth errors
    INVALID_CREDENTIALS(4001, "Invalid username or password"),
    TOKEN_EXPIRED(4002, "Token has expired"),
    TOKEN_INVALID(4003, "Invalid token"),
    UNAUTHORIZED(4004, "Unauthorized access"),
    FORBIDDEN(4005, "Access denied"),

    // User errors
    USER_NOT_FOUND(4101, "User not found"),
    USER_ALREADY_EXISTS(4102, "User already exists"),
    EMAIL_ALREADY_EXISTS(4103, "Email already in use"),
    PROFILE_NOT_FOUND(4104, "Profile not found"),
    ADDRESS_NOT_FOUND(4105, "Address not found"),

    // Product errors
    PRODUCT_NOT_FOUND(4201, "Product not found"),
    PRODUCT_OUT_OF_STOCK(4202, "Product is out of stock"),
    CATEGORY_NOT_FOUND(4203, "Category not found"),

    // Order errors
    ORDER_NOT_FOUND(4301, "Order not found"),
    ORDER_INVALID_STATUS(4302, "Invalid order status transition"),
    ORDER_CANNOT_CANCEL(4303, "Order cannot be cancelled"),

    // Payment errors
    PAYMENT_FAILED(4401, "Payment processing failed"),
    PAYMENT_NOT_FOUND(4402, "Payment not found"),
    INSUFFICIENT_BALANCE(4403, "Insufficient balance"),

    // Validation errors
    VALIDATION_ERROR(4501, "Validation failed"),
    INVALID_INPUT(4502, "Invalid input data"),
    MISSING_REQUIRED_FIELD(4503, "Missing required field"),

    // Wallet errors
    WALLET_NOT_FOUND(4601, "Wallet not found"),
    WALLET_ALREADY_EXISTS(4602, "Wallet already exists"),

    // Transaction errors
    TRANSACTION_NOT_FOUND(4701, "Transaction not found"),
    TRANSACTION_FAILED(4702, "Transaction failed"),

    // Saga errors
    SAGA_NOT_FOUND(4801, "Saga instance not found"),
    SAGA_INVALID_TRANSITION(4802, "Invalid saga state transition"),
    SAGA_STEP_FAILED(4803, "Saga step execution failed"),
    SAGA_COMPENSATION_FAILED(4804, "Saga compensation failed"),

    // System errors
    INTERNAL_ERROR(5001, "Internal server error"),
    SERVICE_UNAVAILABLE(5002, "Service unavailable"),
    DATABASE_ERROR(5003, "Database error"),
    EXTERNAL_SERVICE_ERROR(5004, "External service error");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
