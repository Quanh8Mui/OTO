package com.garage.oto.service;

import com.garage.oto.config.AppProperties;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class VnpayService {

  private final AppProperties appProperties;

  public VnpayService(AppProperties appProperties) {
    this.appProperties = appProperties;
  }

  public String createPaymentUrl(String paymentRef, String orderInfo, long amountVnd, String returnUrl) {
    String tmnCode = appProperties.getVnpay().getTmnCode();
    String hashSecret = (appProperties.getVnpay().getHashSecret() != null && !appProperties.getVnpay().getHashSecret().isBlank())
        ? appProperties.getVnpay().getHashSecret()
        : appProperties.getJwt().getSecret();
    String version = "2.1.0";
    String command = "pay";
    String orderType = "other";
    String locale = "vn";
    String currCode = "VND";

    long amount = amountVnd * 100;
    String createDate = new SimpleDateFormat("yyyyMMddHHmmss") {{ setTimeZone(TimeZone.getTimeZone("Etc/UTC")); }}.format(new Date());

    Map<String, String> params = new LinkedHashMap<>();
    params.put("vnp_Version", version);
    params.put("vnp_Command", command);
    params.put("vnp_TmnCode", tmnCode);
    params.put("vnp_Amount", String.valueOf(amount));
    params.put("vnp_CurrCode", currCode);
    params.put("vnp_TxnRef", paymentRef);
    params.put("vnp_OrderInfo", orderInfo);
    params.put("vnp_OrderType", orderType);
    params.put("vnp_Locale", locale);
    params.put("vnp_ReturnUrl", returnUrl);
    params.put("vnp_IpAddr", "127.0.0.1");
    params.put("vnp_CreateDate", createDate);

    String query = buildQuery(params, true);
    String secureHash = hmacSHA512(hashSecret, query);
    String payUrl = (appProperties.getVnpay().getPayUrl() != null && !appProperties.getVnpay().getPayUrl().isBlank())
        ? appProperties.getVnpay().getPayUrl()
        : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    return UriComponentsBuilder.fromHttpUrl(payUrl)
        .query(query)
        .queryParam("vnp_SecureHash", secureHash)
        .build(true)
        .toUriString();
  }

  public boolean verify(Map<String, String> allParams) {
    String receivedHash = allParams.remove("vnp_SecureHash");
    allParams.remove("vnp_SecureHashType");
    String query = buildQuery(allParams, true);
    String hashSecret = (appProperties.getVnpay().getHashSecret() != null && !appProperties.getVnpay().getHashSecret().isBlank())
        ? appProperties.getVnpay().getHashSecret()
        : appProperties.getJwt().getSecret();
    String expected = hmacSHA512(hashSecret, query);
    return expected.equalsIgnoreCase(receivedHash);
  }

  private String buildQuery(Map<String, String> params, boolean encode) {
    List<String> keys = new ArrayList<>(params.keySet());
    Collections.sort(keys);
    StringBuilder sb = new StringBuilder();
    for (String key : keys) {
      String value = params.get(key);
      if (value == null || value.isBlank()) continue;
      if (sb.length() > 0) sb.append('&');
      sb.append(encode ? urlEncode(key) : key).append('=').append(encode ? urlEncode(value) : value);
    }
    return sb.toString();
  }

  private String hmacSHA512(String key, String data) {
    try {
      Mac hmac512 = Mac.getInstance("HmacSHA512");
      SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
      hmac512.init(secretKey);
      byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
      StringBuilder hexString = new StringBuilder(hash.length * 2);
      for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) hexString.append('0');
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (Exception e) {
      throw new IllegalStateException("Cannot sign VNPay request", e);
    }
  }

  private String urlEncode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("%20", "+");
  }
}
