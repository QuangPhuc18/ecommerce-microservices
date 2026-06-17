package com.c2c.product.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProductListResponse {
    private List<ProductResponse> products;
    private int totalPages;
    private long totalElements;
}
