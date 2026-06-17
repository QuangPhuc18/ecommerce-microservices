package com.c2c.product.service;

import com.c2c.product.dto.request.ProductCreateRequest;
import com.c2c.product.dto.request.ProductUpdateRequest;
import com.c2c.product.dto.response.ProductListResponse;
import com.c2c.product.dto.response.ProductResponse;
import com.c2c.product.messaging.producer.ProductEventProducer;
import com.c2c.product.model.Product;
import com.c2c.product.model.ProductImage;
import com.c2c.product.repository.ProductImageRepository;
import com.c2c.product.repository.ProductRepository;
import com.c2c.product.util.SlugGenerator;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ObjectMapper objectMapper;
    private final ProductEventProducer productEventProducer;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, UUID sellerId, String sellerName) {
        String baseSlug = SlugGenerator.generate(request.getTitle());
        String slug = makeUniqueSlug(baseSlug);

        String attributesJson = null;
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            try {
                attributesJson = objectMapper.writeValueAsString(request.getAttributes());
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to serialize attributes");
            }
        }

        Product product = Product.builder()
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .currency(request.getCurrency())
                .categoryId(request.getCategoryId())
                .sellerId(sellerId)
                .sellerName(sellerName)
                .status(Product.Status.ACTIVE)
                .attributesJson(attributesJson)
                .build();

        product = productRepository.save(product);
        productEventProducer.sendProductChanged(product, "PRODUCT_CREATED");
        return toResponse(product);
    }

    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getTitle() != null) {
            product.setTitle(request.getTitle());
            product.setSlug(makeUniqueSlug(SlugGenerator.generate(request.getTitle())));
        }
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStatus() != null) {
            product.setStatus(Product.Status.valueOf(request.getStatus()));
        }
        if (request.getAttributes() != null) {
            try {
                product.setAttributesJson(objectMapper.writeValueAsString(request.getAttributes()));
            } catch (JsonProcessingException e) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to serialize attributes");
            }
        }

        product = productRepository.save(product);
        productEventProducer.sendProductChanged(product, "PRODUCT_UPDATED");
        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
        productEventProducer.sendProductChanged(product, "PRODUCT_DELETED");
    }

    public ProductListResponse listProducts(int page, int size) {
        Page<Product> productPage = productRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toListResponse(productPage);
    }

    private ProductResponse toResponse(Product product) {
        List<String> imageUrls = productImageRepository.findByProductIdOrderBySortOrder(product.getId())
                .stream().map(ProductImage::getImageUrl).toList();
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .categoryId(product.getCategoryId())
                .sellerId(product.getSellerId())
                .sellerName(product.getSellerName())
                .status(product.getStatus().name())
                .viewCount(product.getViewCount())
                .favoriteCount(product.getFavoriteCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .imageUrls(imageUrls)
                .build();
    }

    private ProductListResponse toListResponse(Page<Product> page) {
        List<ProductResponse> products = page.getContent().stream().map(this::toResponse).toList();
        return ProductListResponse.builder()
                .products(products)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
    }

    private String makeUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}
