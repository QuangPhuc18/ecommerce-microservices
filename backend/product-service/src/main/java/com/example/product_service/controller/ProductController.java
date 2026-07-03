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

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = categoryRepository.findAll().stream()
            .map(cat -> new CategoryDto(String.valueOf(cat.getId()), cat.getName(), cat.getIconName()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            Pageable pageable) {
        return ResponseEntity.ok(productService.searchProducts(keyword, category, location, condition, status, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        // Gán userId cho sản phẩm nếu hệ thống hỗ trợ
        // product.setSellerId(userId);
        return ResponseEntity.ok(productService.createProduct(product));
    }
}