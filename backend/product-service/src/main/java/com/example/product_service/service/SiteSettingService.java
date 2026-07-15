package com.example.product_service.service;

import com.example.product_service.entity.SiteSetting;
import com.example.product_service.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository settingRepository;

    public Map<String, String> getAllSettings() {
        List<SiteSetting> settings = settingRepository.findAll();
        Map<String, String> result = new HashMap<>();
        for (SiteSetting s : settings) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }
        return result;
    }

    @Transactional
    public void updateSettings(Map<String, String> newSettings) {
        for (Map.Entry<String, String> entry : newSettings.entrySet()) {
            SiteSetting setting = settingRepository.findById(entry.getKey()).orElse(new SiteSetting());
            setting.setSettingKey(entry.getKey());
            setting.setSettingValue(entry.getValue());
            settingRepository.save(setting);
        }
    }
}
