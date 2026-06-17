package com.c2c.product.controller;

import com.c2c.product.dto.request.ProductCreateRequest;
import com.c2c.product.dto.request.ProductUpdateRequest;
import com.c2c.product.dto.response.ProductListResponse;
import com.c2c.product.dto.response.ProductResponse;
import com.c2c.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        // TODO: extract seller info from security context
        UUID sellerId = UUID.randomUUID();
        String sellerName = "seller";
        ProductResponse response = productService.createProduct(request, sellerId, sellerName);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,
                                                          @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<ProductListResponse> listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.listProducts(page, size));
    }
}
