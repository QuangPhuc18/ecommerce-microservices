package com.c2c.search.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequest {
    private String query;
    private Long categoryId;
    private Double minPrice;
    private Double maxPrice;
    private String sortBy;
    private String sortOrder;

    @Min(value = 0, message = "Page index must be >= 0")
    private int page = 0;

    @Min(value = 1, message = "Size must be >= 1")
    private int size = 20;
}
