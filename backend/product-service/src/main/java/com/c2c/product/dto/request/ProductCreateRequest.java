package com.c2c.product.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductCreateRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotBlank
    private String currency;

    @NotNull
    private Long categoryId;

    private Map<String, String> attributes;
}
