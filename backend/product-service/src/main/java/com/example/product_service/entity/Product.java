package com.example.product_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;

    private String category;
    private String location;
    private String itemCondition; // NEW, USED
    private String status; // ACTIVE, SOLD

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = true; // Admin approval flag

    // GPS coordinates
    private Double latitude;
    private Double longitude;

    private LocalDateTime createdAt;
    
    @Column(name = "bumped_at")
    private LocalDateTime bumpedAt; // Thời gian đẩy tin

    @Column(name = "attributes", columnDefinition = "TEXT")
    private String attributes; // Lưu trữ JSON của các thuộc tính động

    @ElementCollection
    private java.util.List<String> imageUrls;
}