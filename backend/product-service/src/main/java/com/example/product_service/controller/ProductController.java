package com.example.product_service.controller;

import com.example.product_service.entity.Product;
import com.example.product_service.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;

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
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Order.desc("isVip"),
            org.springframework.data.domain.Sort.Order.desc("bumpedAt")
        );
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
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
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
            
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Kiểm tra quyền: Chỉ ADMIN hoặc chính chủ mới được phép xóa tin đăng
        boolean isAdmin = "ADMIN".equals(role) || "ROLE_ADMIN".equals(role);
        boolean isOwner = userId != null && userId.equals(String.valueOf(product.getSellerId()));
        
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).build();
        }

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

    // Tiêm bean thủ công trong controller do chưa tiêm vào service
    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.web.client.RestTemplate restTemplate;
    
    @org.springframework.beans.factory.annotation.Autowired
    private com.example.product_service.repository.ProductViewHistoryRepository viewHistoryRepository;

    @PutMapping("/{id}/upgrade-vip")
    public ResponseEntity<?> upgradeVip(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        Product product = productService.getProductById(id);
        if (product == null) return ResponseEntity.notFound().build();
        
        if (!product.getSellerId().equals(Long.parseLong(userId))) {
            return ResponseEntity.status(403).body("Chỉ chủ bài đăng mới được nâng cấp VIP");
        }
        
        // Gọi sang user-service để trừ tiền (Giả sử 50 Xu)
        double vipCost = 50.0;
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            // Cần truyền X-User-Id để UserService biết ai đang gọi (dành cho API Gateway / Jwt filter bypass)
            // Trong thực tế cần có cơ chế auth giữa các service, ở đây gọi trực tiếp port hoặc qua gateway
            // Vì RestTemplate gọi trực tiếp port 8085 (user-service) nên cần thêm userId vào RequestAttribute bên user-service hoặc query param
            // Do controller user-service đọc userId từ RequestAttribute, ta có thể sửa UserController bên user-service để nhận qua Header X-User-Id
            // Hoặc gọi thẳng qua api-gateway (localhost:8088/users/me/deduct-balance). Ta sẽ dùng HTTP PUT.
            headers.set("X-User-Id", userId);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            // Ở đây đơn giản hóa, product-service báo cho user-service (hoặc tự thiết kế endpoint)
            ResponseEntity<String> response = restTemplate.exchange(
                    "http://localhost:8085/users/internal/deduct-balance?amount=" + vipCost + "&userId=" + userId,
                    org.springframework.http.HttpMethod.PUT,
                    entity,
                    String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                product.setIsVip(true);
                product.setVipUntil(java.time.LocalDateTime.now().plusDays(7));
                product.setBumpedAt(java.time.LocalDateTime.now());
                productService.updateProduct(id, product);
                return ResponseEntity.ok("Nâng cấp VIP thành công");
            } else {
                return ResponseEntity.badRequest().body("Số dư không đủ");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi thanh toán: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> recordView(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            Product product = productService.getProductById(id);
            if (product != null) {
                com.example.product_service.entity.ProductViewHistory history = new com.example.product_service.entity.ProductViewHistory(
                        Long.parseLong(userId),
                        product.getId(),
                        product.getCategory()
                );
                viewHistoryRepository.save(history);
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        List<Object[]> topCats = viewHistoryRepository.findTopCategoriesByUserId(
                Long.parseLong(userId), 
                org.springframework.data.domain.PageRequest.of(0, 3)
        );
        
        if (topCats.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        List<String> categories = topCats.stream().map(obj -> (String) obj[0]).collect(Collectors.toList());
        
        // Tìm sản phẩm trong các danh mục này
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "bumpedAt"));
        Page<Product> recs = productService.searchProducts(null, categories.get(0), null, null, null, null, null, null, null, pageable);
        
        return ResponseEntity.ok(recs.getContent());
    }
}