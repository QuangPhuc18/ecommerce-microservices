package com.example.product_service.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    
    // Tìm kiếm Full-text (sử dụng Containing thay cho Fuzzy)
    List<ProductDocument> findByNameContainingOrDescriptionContaining(String name, String description);
}
