package com.example.user_service.controller;

import com.example.user_service.config.VNPayConfig;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final UserRepository userRepository;

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.url}")
    private String vnp_Url;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @PostMapping("/create-url")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @RequestParam("amount") long amount,
            @RequestParam(value = "packageType", required = false) String packageType,
            @RequestAttribute("userId") Long userId,
            HttpServletRequest request) {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "NapTien_" + userId;
        if (packageType != null && !packageType.isEmpty()) {
            vnp_OrderInfo = "MuaGoi_" + packageType + "_" + userId;
        }
        String orderType = "other";
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8) + String.valueOf(userId);
        String vnp_IpAddr = "127.0.0.1";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY expects amount in VND * 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        try {
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    //Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    //Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (java.io.UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_Url + "?" + queryUrl;

        try {
            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/return")
    public ResponseEntity<Map<String, String>> paymentReturn(@RequestBody Map<String, String> requestParams) {
        Map<String, String> response = new HashMap<>();
        try {
            String vnp_SecureHash = requestParams.get("vnp_SecureHash");
            if (requestParams.containsKey("vnp_SecureHashType")) {
                requestParams.remove("vnp_SecureHashType");
            }
            if (requestParams.containsKey("vnp_SecureHash")) {
                requestParams.remove("vnp_SecureHash");
            }

            List<String> fieldNames = new ArrayList<>(requestParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) requestParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
            if (signValue.equals(vnp_SecureHash)) {
                String vnp_ResponseCode = requestParams.get("vnp_ResponseCode");
                String vnp_OrderInfo = requestParams.get("vnp_OrderInfo");
                String vnp_Amount = requestParams.get("vnp_Amount");

                if ("00".equals(vnp_ResponseCode)) {
                    try {
                        if (vnp_OrderInfo.startsWith("NapTien_")) {
                            String[] parts = vnp_OrderInfo.split("_");
                            Long userId = Long.parseLong(parts[1]);
                            
                            User user = userRepository.findById(userId).orElseThrow();
                            double amount = Double.parseDouble(vnp_Amount) / 100.0;
                            user.setBalance(user.getBalance() + amount);
                            userRepository.save(user);
                            
                            response.put("status", "success");
                            response.put("message", "Nạp tiền vào ví thành công.");
                            return ResponseEntity.ok(response);
                        } else if (vnp_OrderInfo.startsWith("MuaGoi_")) {
                            String[] parts = vnp_OrderInfo.split("_");
                            String packageType = parts[1];
                            Long userId = Long.parseLong(parts[2]);
                            
                            User user = userRepository.findById(userId).orElseThrow();
                            user.setVipPackage(packageType);
                            user.setVipPackageUntil(java.time.LocalDateTime.now().plusDays(30));
                            userRepository.save(user);
                            
                            response.put("status", "success");
                            response.put("message", "Đăng ký Gói " + packageType + " thành công!");
                            return ResponseEntity.ok(response);
                        } else {
                            response.put("status", "error");
                            response.put("message", "Thông tin giao dịch không hợp lệ.");
                        }
                    } catch (Exception e) {
                        response.put("status", "error");
                        response.put("message", "Lỗi khi cập nhật tài khoản: " + e.getMessage());
                    }
                } else {
                    response.put("status", "error");
                    response.put("message", "Giao dịch không thành công. Mã lỗi: " + vnp_ResponseCode);
                }
                return ResponseEntity.badRequest().body(response);
            } else {
                response.put("status", "error");
                response.put("message", "Chữ ký không hợp lệ!");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi server.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
