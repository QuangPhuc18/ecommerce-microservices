package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_view_history")
@Data
@NoArgsConstructor
public class ProductViewHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    public ProductViewHistory(Long userId, Long productId, String category) {
        this.userId = userId;
        this.productId = productId;
        this.category = category;
        this.viewedAt = LocalDateTime.now();
    }
}
