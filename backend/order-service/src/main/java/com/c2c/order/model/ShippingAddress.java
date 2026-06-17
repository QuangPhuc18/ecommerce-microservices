package com.c2c.order.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {
    private String fullName;
    private String phone;
    private String address;
    private String ward;
    private String district;
    private String province;
}
