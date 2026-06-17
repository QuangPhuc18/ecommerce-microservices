package com.c2c.product.service;

import com.c2c.product.model.Category;
import com.c2c.product.repository.CategoryRepository;
import com.c2c.product.util.SlugGenerator;
import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(String name, String description, Long parentId, int sortOrder) {
        String slug = SlugGenerator.generate(name);
        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Category slug already exists: " + slug);
        }
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .parentId(parentId)
                .sortOrder(sortOrder)
                .active(true)
                .build();
        return categoryRepository.save(category);
    }

    public List<Map<String, Object>> getCategoryTree() {
        List<Category> roots = categoryRepository.findByParentIdIsNullOrderBySortOrder();
        return roots.stream().map(this::toNode).toList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toNode(Category category) {
        List<Map<String, Object>> children = categoryRepository.findByParentIdOrderBySortOrder(category.getId())
                .stream().map(this::toNode).toList();
        return Map.of(
                "id", category.getId(),
                "name", category.getName(),
                "slug", category.getSlug(),
                "description", category.getDescription(),
                "sortOrder", category.getSortOrder(),
                "active", category.isActive(),
                "children", children
        );
    }
}
