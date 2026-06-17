package com.c2c.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSearchResponse {
    private String id;
    private String title;
    private String description;
    private Double price;
    private String currency;
    private String categoryName;
    private String sellerName;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
}
