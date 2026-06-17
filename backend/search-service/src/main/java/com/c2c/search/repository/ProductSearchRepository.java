package com.c2c.search.repository;

import com.c2c.search.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {

    List<ProductDocument> findByTitleContainingIgnoreCase(String title);

    List<ProductDocument> findByCategoryId(Long categoryId);

    List<ProductDocument> findBySellerId(Long sellerId);

    List<ProductDocument> findByStatus(String status);
}
