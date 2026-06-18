package com.example.product_service.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    
    // Tìm kiếm Full-text sai chính tả (fuzzy)
    List<ProductDocument> findByNameFuzzyOrDescriptionFuzzy(String name, String description);
}
