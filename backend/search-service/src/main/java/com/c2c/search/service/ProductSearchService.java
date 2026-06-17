package com.c2c.search.service;

import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.RangeQuery;
import co.elastic.clients.json.JsonData;
import com.c2c.search.document.ProductDocument;
import com.c2c.search.dto.request.SearchRequest;
import com.c2c.search.dto.response.ProductSearchResponse;
import com.c2c.search.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductSearchService {

    private final ProductSearchRepository repository;
    private final ElasticsearchOperations elasticsearchOperations;

    public Page<ProductSearchResponse> searchProducts(SearchRequest request) {
        Query query = buildSearchQuery(request);

        String sortField = resolveSortField(request.getSortBy());
        SortOrder sortOrder = "desc".equalsIgnoreCase(request.getSortOrder())
                ? SortOrder.Desc : SortOrder.Asc;

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        NativeQuery nativeQuery = new NativeQueryBuilder()
                .withQuery(query)
                .withSort(s -> s.field(f -> f.field(sortField).order(sortOrder)))
                .withPageable(pageable)
                .build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductDocument.class, IndexCoordinates.of("products"));

        List<ProductSearchResponse> content = searchHits.stream()
                .map(this::toResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                content, pageable, searchHits.getTotalHits());
    }

    public void indexProduct(ProductDocument document) {
        repository.save(document);
        log.info("Indexed product {} in Elasticsearch", document.getProductId());
    }

    public void deleteProduct(String id) {
        repository.deleteById(id);
        log.info("Deleted product document {} from Elasticsearch", id);
    }

    private Query buildSearchQuery(SearchRequest request) {
        BoolQuery.Builder boolBuilder = new BoolQuery.Builder();

        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            String q = request.getQuery();
            boolBuilder.must(m -> m.multiMatch(mm -> mm
                    .query(q)
                    .fields("title^3", "description")
                    .fuzziness("AUTO")
            ));
        }

        if (request.getCategoryId() != null) {
            boolBuilder.filter(f -> f.term(t -> t
                    .field("categoryId")
                    .value(request.getCategoryId())
            ));
        }

        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            RangeQuery.Builder rangeBuilder = new RangeQuery.Builder().field("price");
            if (request.getMinPrice() != null) {
                rangeBuilder.gte(JsonData.of(request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                rangeBuilder.lte(JsonData.of(request.getMaxPrice()));
            }
            boolBuilder.filter(f -> f.range(rangeBuilder.build()));
        }

        return boolBuilder.build()._toQuery();
    }

    private String resolveSortField(String sortBy) {
        if (sortBy == null) return "createdAt";
        return switch (sortBy.toLowerCase()) {
            case "price" -> "price";
            case "viewcount", "views" -> "viewCount";
            case "favoritecount", "favorites" -> "favoriteCount";
            default -> "createdAt";
        };
    }

    private ProductSearchResponse toResponse(SearchHit<ProductDocument> hit) {
        ProductDocument doc = hit.getContent();
        if (doc == null) return null;

        String imageUrl = (doc.getImageUrls() != null && !doc.getImageUrls().isEmpty())
                ? doc.getImageUrls().get(0) : null;

        return ProductSearchResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .price(doc.getPrice())
                .currency(doc.getCurrency())
                .categoryName(doc.getCategoryName())
                .sellerName(doc.getSellerName())
                .imageUrl(imageUrl)
                .status(doc.getStatus())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
