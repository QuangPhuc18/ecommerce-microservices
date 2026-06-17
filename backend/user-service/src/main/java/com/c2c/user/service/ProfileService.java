package com.c2c.user.service;

import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import com.c2c.user.dto.UserProfileDTO;
import com.c2c.user.model.ClientProfile;
import com.c2c.user.repository.ClientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ClientProfileRepository profileRepository;

    public UserProfileDTO getProfile(UUID userId) {
        ClientProfile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROFILE_NOT_FOUND, "Profile not found"));
        return toDTO(profile);
    }

    @Transactional
    public UserProfileDTO updateProfile(UUID userId, UserProfileDTO dto) {
        ClientProfile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROFILE_NOT_FOUND, "Profile not found"));
        if (dto.getFullName() != null) profile.setFullName(dto.getFullName());
        if (dto.getAvatarUrl() != null) profile.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        return toDTO(profileRepository.save(profile));
    }

    @Transactional
    public ClientProfile createDefaultProfile(UUID userId, String fullName) {
        ClientProfile profile = ClientProfile.builder()
                .userId(userId)
                .fullName(fullName != null ? fullName : "User")
                .build();
        return profileRepository.save(profile);
    }

    private UserProfileDTO toDTO(ClientProfile profile) {
        return UserProfileDTO.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .avatarUrl(profile.getAvatarUrl())
                .phone(profile.getPhone())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
