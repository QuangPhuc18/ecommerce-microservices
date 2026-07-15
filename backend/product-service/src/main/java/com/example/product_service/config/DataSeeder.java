package com.example.product_service.config;

import com.example.product_service.entity.Banner;
import com.example.product_service.entity.Category;
import com.example.product_service.entity.SiteSetting;
import com.example.product_service.repository.BannerRepository;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BannerRepository bannerRepository;
    private final SiteSettingRepository siteSettingRepository;

    @Override
    public void run(String... args) throws Exception {
        // Auto seed data if categories table is empty
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                new Category(null, "Điện thoại", "Smartphone", null),
                new Category(null, "Xe máy", "Bike", null),
                new Category(null, "Bất động sản", "Home", null),
                new Category(null, "Xe cộ", "Car", null),
                new Category(null, "Việc làm", "Briefcase", null),
                new Category(null, "Điện tử", "Monitor", null),
                new Category(null, "Thú cưng", "Dog", null),
                new Category(null, "Điện lạnh", "Refrigerator", null),
                new Category(null, "Nội thất", "Sofa", null)
            );
            categoryRepository.saveAll(categories);
            System.out.println("✅ Seeded initial categories into database.");
        }

        // Auto seed data for banners if table is empty
        if (bannerRepository.count() == 0) {
            Banner banner = new Banner();
            banner.setImageUrl("/banner.png");
            banner.setTargetUrl("#");
            banner.setIsActive(true);
            bannerRepository.save(banner);
            System.out.println("✅ Seeded initial banner into database.");
        }

        // Auto seed site settings if empty
        if (siteSettingRepository.count() == 0) {
            siteSettingRepository.save(new SiteSetting("logo_url", "https://lh3.googleusercontent.com/aida/AP1WRLt1b6uRk0WeBQP_Vq4eC801Bxw7riM83V7hgySe2KY4ZPcNCBc_I7CYH866KRFfrUpT6ZkHNm1qm7Q2KReEjcyMBK8MfeRN6SBrmX9xZv_0d1rzMwxd79c7y8BCjpmYmZefC0UTUYUNeNPGqLy9TTYR-WDs5GLAmF_ItBY6v86-Kk4C63MA5QwmBPIGxrGUJAPAkBuWJRjcVBAIPGrLMwv6xK3gVEcQVvCXqZIbBlkOP9I_glISv1g_PTk", null));
            siteSettingRepository.save(new SiteSetting("footer_description", "Nền tảng mua bán đồ cũ an toàn, tiện lợi và đáng tin cậy. Renewed Value Community.", null));
            siteSettingRepository.save(new SiteSetting("footer_copyright", "© 2024 ĐồCũ. Renewed Value Community.", null));
            System.out.println("✅ Seeded initial site settings into database.");
        }
    }
}
