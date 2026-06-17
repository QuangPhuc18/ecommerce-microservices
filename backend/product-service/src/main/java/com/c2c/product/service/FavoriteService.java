package com.c2c.product.service;

import com.c2c.product.model.Product;
import com.c2c.product.model.ProductFavorite;
import com.c2c.product.repository.ProductFavoriteRepository;
import com.c2c.product.repository.ProductRepository;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final ProductFavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void toggleFavorite(Long productId, UUID userId) {
        if (!productRepository.existsById(productId)) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        if (favoriteRepository.existsByProductIdAndUserId(productId, userId)) {
            favoriteRepository.deleteByProductIdAndUserId(productId, userId);
            updateFavoriteCount(productId);
        } else {
            ProductFavorite favorite = ProductFavorite.builder()
                    .productId(productId)
                    .userId(userId)
                    .build();
            favoriteRepository.save(favorite);
            updateFavoriteCount(productId);
        }
    }

    public boolean isFavorited(Long productId, UUID userId) {
        return favoriteRepository.existsByProductIdAndUserId(productId, userId);
    }

    public int getFavoriteCount(Long productId) {
        return favoriteRepository.countByProductId(productId);
    }

    private void updateFavoriteCount(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setFavoriteCount(favoriteRepository.countByProductId(productId));
        productRepository.save(product);
    }
}
