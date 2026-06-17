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
