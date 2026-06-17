package com.c2c.product.service;

import com.c2c.product.model.ProductImage;
import com.c2c.product.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ProductImageRepository productImageRepository;

    @Transactional
    public ProductImage addImage(Long productId, String imageUrl, int sortOrder) {
        ProductImage image = ProductImage.builder()
                .productId(productId)
                .imageUrl(imageUrl)
                .sortOrder(sortOrder)
                .build();
        return productImageRepository.save(image);
    }

    public List<ProductImage> getImagesByProductId(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrder(productId);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        productImageRepository.deleteById(imageId);
    }

    @Transactional
    public void deleteAllByProductId(Long productId) {
        productImageRepository.deleteByProductId(productId);
    }
}
