package com.c2c.product.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "seller_name", nullable = false, length = 150)
    private String sellerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(name = "attributes_json", columnDefinition = "TEXT")
    @JdbcTypeCode(SqlTypes.JSON)
    private String attributesJson;

    @Column(name = "view_count")
    private int viewCount;

    @Column(name = "favorite_count")
    private int favoriteCount;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = Status.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Status {
        ACTIVE, INACTIVE, SOLD, HIDDEN
    }
}
