package com.c2c.product.repository;

import com.c2c.product.model.BoostPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BoostPackageRepository extends JpaRepository<BoostPackage, Long> {
    List<BoostPackage> findByProductId(Long productId);
    List<BoostPackage> findByActiveTrueAndEndDateAfter(LocalDateTime now);
}
