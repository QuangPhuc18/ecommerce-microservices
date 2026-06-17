# T03: Shared Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Create `shared-lib` module with shared DTOs, Events, Exceptions, and Utilities for all microservices.

**Architecture:** Maven module at `backend/shared-lib/`, packaged as `.jar`. All other services will depend on it. Uses Lombok for boilerplate reduction, MapStruct for entity-DTO mapping interfaces.

**Tech Stack:** Java 21, Maven, Lombok, MapStruct, Spring Boot 3.2.x

---

### Task 1: Create shared-lib pom.xml

**Files:**
- Create: `backend/shared-lib/pom.xml`

- [ ] **Write pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.c2c</groupId>
        <artifactId>ecommerce-microservices</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>shared-lib</artifactId>
    <packaging>jar</packaging>
    <name>Shared Library</name>
    <description>Shared DTOs, Events, Exceptions and Utilities</description>

    <properties>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
        <jackson.version>2.16.1</jackson.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok-mapstruct-binding</artifactId>
                            <version>${lombok-mapstruct-binding.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

### Task 2: Create DTO classes

**Files:**
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/dto/UserDTO.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/dto/ProductDTO.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/dto/OrderDTO.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/dto/PaymentDTO.java`

- [ ] **Create UserDTO.java**

```java
package com.c2c.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO implements Serializable {
    private Long id;
    private String email;
    private String username;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Create ProductDTO.java**

```java
package com.c2c.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO implements Serializable {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String currency;
    private Long categoryId;
    private String categoryName;
    private Long sellerId;
    private String sellerName;
    private List<String> imageUrls;
    private String status;
    private int viewCount;
    private int favoriteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Create OrderDTO.java**

```java
package com.c2c.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO implements Serializable {
    private Long id;
    private String orderCode;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String currency;
    private int quantity;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Create PaymentDTO.java**

```java
package com.c2c.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO implements Serializable {
    private Long id;
    private String transactionCode;
    private Long orderId;
    private String orderCode;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private String gatewayTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### Task 3: Create Event classes

**Files:**
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/event/OrderCreatedEvent.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/event/OrderStatusChangedEvent.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/event/PaymentProcessedEvent.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/event/ProductEvent.java`

- [ ] **Create OrderCreatedEvent.java**

```java
package com.c2c.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent implements Serializable {
    private String eventId;
    private Long orderId;
    private String orderCode;
    private Long buyerId;
    private Long sellerId;
    private Long productId;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createdAt;
}
```

- [ ] **Create OrderStatusChangedEvent.java**

```java
package com.c2c.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusChangedEvent implements Serializable {
    private String eventId;
    private Long orderId;
    private String orderCode;
    private String fromStatus;
    private String toStatus;
    private String reason;
    private LocalDateTime timestamp;
}
```

- [ ] **Create PaymentProcessedEvent.java**

```java
package com.c2c.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProcessedEvent implements Serializable {
    private String eventId;
    private Long transactionId;
    private String transactionCode;
    private Long orderId;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime processedAt;
}
```

- [ ] **Create ProductEvent.java**

```java
package com.c2c.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEvent implements Serializable {
    private String eventId;
    private String eventType;
    private Long productId;
    private String productName;
    private Long sellerId;
    private String sellerName;
    private BigDecimal price;
    private String status;
    private LocalDateTime timestamp;
}
```

---

### Task 4: Create Exception classes

**Files:**
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/exception/ErrorCode.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/exception/BusinessException.java`

- [ ] **Create ErrorCode.java**

```java
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
```

- [ ] **Create BusinessException.java**

```java
package com.c2c.shared.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }

    public int getCode() {
        return errorCode.getCode();
    }
}
```

---

### Task 5: Create Utility classes

**Files:**
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/util/JsonUtils.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/util/DateUtils.java`
- Create: `backend/shared-lib/src/main/java/com/c2c/shared/util/Constants.java`

- [ ] **Create JsonUtils.java**

```java
package com.c2c.shared.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public final class JsonUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private JsonUtils() {}

    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert object to JSON", e);
            return null;
        }
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (IOException e) {
            log.error("Failed to parse JSON", e);
            return null;
        }
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
```

- [ ] **Create DateUtils.java**

```java
package com.c2c.shared.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateUtils {
    public static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    public static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_FORMAT);
    public static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern(ISO_FORMAT);

    private DateUtils() {}

    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DEFAULT_FORMATTER);
    }

    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    public static String formatIso(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(ISO_FORMATTER);
    }

    public static LocalDateTime parse(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateStr, DEFAULT_FORMATTER);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    public static LocalDateTime parse(String dateStr, String pattern) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
```

- [ ] **Create Constants.java**

```java
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
```

---

### Task 6: Build and verify

- [ ] **Build shared-lib**

```bash
mvn clean install -pl shared-lib -am -f backend/pom.xml
```
Expected: BUILD SUCCESS, shared-lib-1.0.0-SNAPSHOT.jar created in `backend/shared-lib/target/`

- [ ] **Verify JAR was created**

```bash
Test-Path -LiteralPath "backend/shared-lib/target/shared-lib-1.0.0-SNAPSHOT.jar"
```
Expected: True
