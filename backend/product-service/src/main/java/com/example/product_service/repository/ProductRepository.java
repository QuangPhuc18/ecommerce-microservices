package com.example.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.product_service.entity.Product;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query(value = "SELECT * FROM products p WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL " +
                   "AND ST_Distance_Sphere(point(p.longitude, p.latitude), point(:lng, :lat)) <= :radius", 
           nativeQuery = true)
    List<Product> findProductsWithinRadius(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radius") Double radius);
}