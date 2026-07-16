import java.util.*;
import java.net.*;
import java.nio.charset.*;
import java.text.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public class TestVnpaySignature {
    public static void main(String[] args) throws Exception {
        String vnp_TmnCode = "U1JI07HL";
        String vnp_HashSecret = "SWTQ3QEHJTK5C1S8Z4FAM9MS9GG9MGVG";
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", "99900000");
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", "99999999");
        vnp_Params.put("vnp_OrderInfo", "NapTien");
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", "http://localhost:5173/payment-return");
        vnp_Params.put("vnp_IpAddr", "113.190.233.150");
        
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        
        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));
        
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                String encodedValue = URLEncoder.encode(fieldValue, "US-ASCII");
                hashData.append(fieldName).append('=').append(encodedValue);
                query.append(URLEncoder.encode(fieldName, "US-ASCII")).append('=').append(encodedValue);
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        hmac512.init(new SecretKeySpec(vnp_HashSecret.getBytes(), "HmacSHA512"));
        byte[] result = hmac512.doFinal(hashData.toString().getBytes(StandardCharsets.US_ASCII));
        StringBuilder sb = new StringBuilder();
        for (byte b : result) sb.append(String.format("%02x", b & 0xff));
        
        String queryUrl = query.toString() + "&vnp_SecureHash=" + sb.toString();
        String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + queryUrl;
        
        System.out.println("Payment URL: " + paymentUrl);
        
        URL url = new URL(paymentUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("GET");
        System.out.println("Response Code: " + conn.getResponseCode());
        System.out.println("Location: " + conn.getHeaderField("Location"));
    }
}
