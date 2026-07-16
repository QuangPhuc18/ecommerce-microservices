package com.example.product_service.repository;

import com.example.product_service.entity.ProductViewHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductViewHistoryRepository extends JpaRepository<ProductViewHistory, Long> {
    
    Optional<ProductViewHistory> findByUserIdAndProductId(Long userId, Long productId);
    
    @Query("SELECT h.category, COUNT(h) as cnt FROM ProductViewHistory h WHERE h.userId = :userId GROUP BY h.category ORDER BY cnt DESC")
    List<Object[]> findTopCategoriesByUserId(@Param("userId") Long userId, Pageable pageable);
}
