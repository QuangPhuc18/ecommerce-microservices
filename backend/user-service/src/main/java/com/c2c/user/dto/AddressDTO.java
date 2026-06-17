package com.c2c.user.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {
    private Long id;
    private String receiverName;
    private String phone;
    private String address;
    private String provinceId;
    private String districtId;
    private String wardId;
    private boolean isDefault;
}
