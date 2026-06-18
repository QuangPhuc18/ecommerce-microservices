package com.c2c.payment.service;

import com.c2c.payment.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnpayConfig;

    public String createPaymentUrl(String orderInfo, long amount, String bankCode, String locale) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", locale != null ? locale : "vn");
        params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        if (bankCode != null && !bankCode.isEmpty()) {
            params.put("vnp_BankCode", bankCode);
        }

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        params.forEach((key, value) -> {
            if (value != null && !value.isEmpty()) {
                hashData.append(key).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8)).append('&');
                query.append(key).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8)).append('&');
            }
        });

        String rawHash = hashData.substring(0, hashData.length() - 1);
        String secureHash = hmacSHA512(vnpayConfig.getHashSecret(), rawHash);
        query.append("vnp_SecureHash").append('=').append(URLEncoder.encode(secureHash, StandardCharsets.UTF_8));

        return vnpayConfig.getPaymentUrl() + "?" + query;
    }

    public boolean verifyReturn(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        new TreeMap<>(params).forEach((key, value) -> {
            if (value != null && !value.isEmpty()) {
                hashData.append(key).append('=').append(value).append('&');
            }
        });

        String rawHash = hashData.substring(0, hashData.length() - 1);
        String computedHash = hmacSHA512(vnpayConfig.getHashSecret(), rawHash);
        return computedHash.equals(secureHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to generate HMAC-SHA512", e);
            throw new RuntimeException("VNPay hash generation failed", e);
        }
    }
}
