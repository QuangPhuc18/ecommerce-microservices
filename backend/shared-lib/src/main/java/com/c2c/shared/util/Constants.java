package com.c2c.shared.util;

public final class Constants {
    private Constants() {}

    // Service names
    public static final String AUTH_SERVICE = "auth-service";
    public static final String USER_SERVICE = "user-service";
    public static final String PRODUCT_SERVICE = "product-service";
    public static final String SEARCH_SERVICE = "search-service";
    public static final String ORDER_SERVICE = "order-service";
    public static final String PAYMENT_SERVICE = "payment-service";
    public static final String CHAT_SERVICE = "chat-service";
    public static final String NOTIFICATION_SERVICE = "notification-service";

    // Kafka topics
    public static final String TOPIC_ORDER_CREATED = "order.created";
    public static final String TOPIC_ORDER_STATUS_CHANGED = "order.status.changed";
    public static final String TOPIC_PAYMENT_PROCESSED = "payment.processed";
    public static final String TOPIC_PRODUCT_CHANGED = "product.changed";
    public static final String TOPIC_USER_REGISTERED = "user.registered";
    public static final String TOPIC_NOTIFICATION_SEND = "notification.send";

    // Order statuses
    public static final String ORDER_STATUS_PENDING = "PENDING";
    public static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    public static final String ORDER_STATUS_PROCESSING = "PROCESSING";
    public static final String ORDER_STATUS_SHIPPED = "SHIPPED";
    public static final String ORDER_STATUS_DELIVERED = "DELIVERED";
    public static final String ORDER_STATUS_CANCELLED = "CANCELLED";
    public static final String ORDER_STATUS_REFUNDED = "REFUNDED";

    // Payment statuses
    public static final String PAYMENT_STATUS_PENDING = "PENDING";
    public static final String PAYMENT_STATUS_PROCESSING = "PROCESSING";
    public static final String PAYMENT_STATUS_COMPLETED = "COMPLETED";
    public static final String PAYMENT_STATUS_FAILED = "FAILED";
    public static final String PAYMENT_STATUS_REFUNDED = "REFUNDED";

    // Product statuses
    public static final String PRODUCT_STATUS_ACTIVE = "ACTIVE";
    public static final String PRODUCT_STATUS_INACTIVE = "INACTIVE";
    public static final String PRODUCT_STATUS_SOLD = "SOLD";
    public static final String PRODUCT_STATUS_HIDDEN = "HIDDEN";

    // Cache keys
    public static final String CACHE_PRODUCTS = "products";
    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_USERS = "users";

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
}
