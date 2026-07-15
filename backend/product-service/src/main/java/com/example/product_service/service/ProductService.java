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

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.example.product_service.config.RabbitMQConfig;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public Page<Product> searchProducts(String keyword, String category, String subCategory, String location, String condition, String status, Double minPrice, Double maxPrice, Long sellerId, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterProducts(keyword, category, subCategory, location, condition, status, minPrice, maxPrice, sellerId);
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
        Product savedProduct = productRepository.save(product);
        
        try {
            // Phát sự kiện có sản phẩm mới
            rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, "product.created", savedProduct);
        } catch (Exception e) {
            System.err.println("Lỗi gửi message RabbitMQ: " + e.getMessage());
        }
        
        return savedProduct;
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = getProductById(id);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setItemCondition(updatedProduct.getItemCondition());
        product.setCategory(updatedProduct.getCategory());
        product.setSubCategory(updatedProduct.getSubCategory());
        product.setLocation(updatedProduct.getLocation());
        product.setStatus(updatedProduct.getStatus());
        product.setApproved(updatedProduct.isApproved());
        product.setStock(updatedProduct.getStock());
        product.setImageUrls(updatedProduct.getImageUrls());
        product.setAttributes(updatedProduct.getAttributes());
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}