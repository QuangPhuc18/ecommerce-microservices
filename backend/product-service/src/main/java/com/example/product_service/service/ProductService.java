package com.example.product_service.service;

import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.product_service.repository.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Page<Product> searchProducts(String keyword, String category, String location, String condition, String status, Double minPrice, Double maxPrice, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterProducts(keyword, category, location, condition, status, minPrice, maxPrice);
        return productRepository.findAll(spec, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Product createProduct(Product product) {
        // Set default status
        if (product.getStatus() == null) {
            product.setStatus("AVAILABLE");
        }
        return productRepository.save(product);
    }
}