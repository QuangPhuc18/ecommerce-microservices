package com.c2c.product.repository;

import com.c2c.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<Product> findByStatus(Product.Status status, Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findBySellerId(java.util.UUID sellerId, Pageable pageable);
}
