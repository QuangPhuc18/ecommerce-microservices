package com.c2c.user.service;

import com.c2c.shared.exception.BusinessException;
import com.c2c.shared.exception.ErrorCode;
import com.c2c.user.dto.AddressDTO;
import com.c2c.user.model.UserAddress;
import com.c2c.user.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final UserAddressRepository addressRepository;

    public List<AddressDTO> getAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public AddressDTO createAddress(UUID userId, AddressDTO dto) {
        if (dto.isDefault()) {
            clearDefaultFlag(userId);
        }
        UserAddress address = UserAddress.builder()
                .userId(userId)
                .receiverName(dto.getReceiverName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .provinceId(dto.getProvinceId())
                .districtId(dto.getDistrictId())
                .wardId(dto.getWardId())
                .isDefault(dto.isDefault())
                .build();
        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(Long addressId, UUID userId, AddressDTO dto) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
        }
        if (dto.isDefault() && !address.isDefault()) {
            clearDefaultFlag(userId);
        }
        if (dto.getReceiverName() != null) address.setReceiverName(dto.getReceiverName());
        if (dto.getPhone() != null) address.setPhone(dto.getPhone());
        if (dto.getAddress() != null) address.setAddress(dto.getAddress());
        if (dto.getProvinceId() != null) address.setProvinceId(dto.getProvinceId());
        if (dto.getDistrictId() != null) address.setDistrictId(dto.getDistrictId());
        if (dto.getWardId() != null) address.setWardId(dto.getWardId());
        address.setDefault(dto.isDefault());
        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long addressId, UUID userId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
        }
        addressRepository.delete(address);
    }

    private void clearDefaultFlag(UUID userId) {
        List<UserAddress> userAddresses = addressRepository.findByUserIdOrderByCreatedAtDesc(userId);
        userAddresses.forEach(a -> { a.setDefault(false); addressRepository.save(a); });
    }

    private AddressDTO toDTO(UserAddress address) {
        return AddressDTO.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .phone(address.getPhone())
                .address(address.getAddress())
                .provinceId(address.getProvinceId())
                .districtId(address.getDistrictId())
                .wardId(address.getWardId())
                .isDefault(address.isDefault())
                .build();
    }
}
