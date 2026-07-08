package com.example.product_service.controller;

import com.example.product_service.entity.Product;
import com.example.product_service.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/{productId}")
    public ResponseEntity<?> toggleFavorite(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable Long productId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        favoriteService.toggleFavorite(Long.parseLong(userId), productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Product>> getFavorites(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(favoriteService.getFavoriteProducts(Long.parseLong(userId)));
    }
}
