package com.c2c.product.repository;

import com.c2c.product.model.ProductFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductFavoriteRepository extends JpaRepository<ProductFavorite, Long> {
    boolean existsByProductIdAndUserId(Long productId, UUID userId);
    Optional<ProductFavorite> findByProductIdAndUserId(Long productId, UUID userId);
    int countByProductId(Long productId);
    void deleteByProductIdAndUserId(Long productId, UUID userId);
}
