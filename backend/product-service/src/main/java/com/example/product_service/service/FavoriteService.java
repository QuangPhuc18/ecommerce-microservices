package com.example.product_service.service;

import com.example.product_service.entity.FavoriteProduct;
import com.example.product_service.entity.Product;
import com.example.product_service.repository.FavoriteProductRepository;
import com.example.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteProductRepository favoriteProductRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void toggleFavorite(Long userId, Long productId) {
        if (favoriteProductRepository.existsByUserIdAndProductId(userId, productId)) {
            favoriteProductRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            FavoriteProduct favorite = new FavoriteProduct();
            favorite.setUserId(userId);
            favorite.setProductId(productId);
            favorite.setCreatedAt(LocalDateTime.now());
            favoriteProductRepository.save(favorite);
        }
    }

    public List<Product> getFavoriteProducts(Long userId) {
        List<FavoriteProduct> favorites = favoriteProductRepository.findByUserId(userId);
        List<Long> productIds = favorites.stream().map(FavoriteProduct::getProductId).collect(Collectors.toList());
        return productRepository.findAllById(productIds);
    }
}
