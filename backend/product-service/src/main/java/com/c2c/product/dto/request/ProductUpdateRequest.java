package com.c2c.product.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductUpdateRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String status;
    private Map<String, String> attributes;
}
