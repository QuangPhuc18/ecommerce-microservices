package com.example.product_service.controller;

import com.example.product_service.entity.Product;
import com.example.product_service.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import com.example.product_service.dto.CategoryDto;

import com.example.product_service.repository.CategoryRepository;
import java.util.stream.Collectors;

// ProductController.java
@RestController
@RequestMapping("/products")    
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "bumpedAt"));
        return ResponseEntity.ok(productService.searchProducts(keyword, category, subCategory, location, condition, status, minPrice, maxPrice, sellerId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            product.setSellerId(Long.parseLong(userId));
        } else {
            // Nếu không có userId từ Gateway, có thể ném Exception hoặc gán mặc định (ví dụ: Admin ID)
            product.setSellerId(0L); 
        }
        product.setCreatedAt(java.time.LocalDateTime.now());
        product.setBumpedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/bump")
    public ResponseEntity<?> bumpProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        if (!product.getSellerId().equals(Long.parseLong(userId))) {
            return ResponseEntity.status(403).body("Bạn không có quyền đẩy tin này");
        }
        product.setBumpedAt(java.time.LocalDateTime.now());
        productService.updateProduct(id, product);
        return ResponseEntity.ok().build();
    }
}