package com.c2c.product.controller;

import com.c2c.product.model.Category;
import com.c2c.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String description = (String) body.get("description");
        Long parentId = body.get("parentId") != null ? ((Number) body.get("parentId")).longValue() : null;
        int sortOrder = body.get("sortOrder") != null ? ((Number) body.get("sortOrder")).intValue() : 0;
        Category category = categoryService.createCategory(name, description, parentId, sortOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }
}
