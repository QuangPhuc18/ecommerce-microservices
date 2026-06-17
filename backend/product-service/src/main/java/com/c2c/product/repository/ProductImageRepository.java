package com.c2c.product.repository;

import com.c2c.product.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderBySortOrder(Long productId);
    void deleteByProductId(Long productId);
}
