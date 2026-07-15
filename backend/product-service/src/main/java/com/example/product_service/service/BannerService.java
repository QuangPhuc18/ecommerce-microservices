package com.example.product_service.service;

import com.example.product_service.entity.Banner;
import com.example.product_service.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setTargetUrl(bannerDetails.getTargetUrl());
        banner.setIsActive(bannerDetails.getIsActive());
        
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
