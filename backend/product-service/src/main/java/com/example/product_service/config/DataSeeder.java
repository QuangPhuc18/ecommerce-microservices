package com.example.product_service.config;

import com.example.product_service.entity.Category;
import com.example.product_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Auto seed data if categories table is empty
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                new Category(null, "Điện thoại", "Smartphone"),
                new Category(null, "Xe máy", "Bike"),
                new Category(null, "Bất động sản", "Home"),
                new Category(null, "Xe cộ", "Car"),
                new Category(null, "Việc làm", "Briefcase"),
                new Category(null, "Điện tử", "Monitor"),
                new Category(null, "Thú cưng", "Dog"),
                new Category(null, "Điện lạnh", "Refrigerator"),
                new Category(null, "Nội thất", "Sofa")
            );
            categoryRepository.saveAll(categories);
            System.out.println("✅ Seeded initial categories into database.");
        }
    }
}
