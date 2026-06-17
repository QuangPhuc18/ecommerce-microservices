package com.c2c.product.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private BigDecimal price;
    private String currency;
    private Long categoryId;
    private UUID sellerId;
    private String sellerName;
    private String status;
    private int viewCount;
    private int favoriteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;
}
