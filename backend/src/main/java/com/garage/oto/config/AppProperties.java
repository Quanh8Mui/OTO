package com.garage.oto.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

  private final Jwt jwt = new Jwt();
  private final Cors cors = new Cors();
  private final Vnpay vnpay = new Vnpay();

  @Getter
  @Setter
  public static class Jwt {
    private String secret;
    private long expirationMs;
  }

  @Getter
  @Setter
  public static class Cors {
    private String allowedOrigins;
  }

  @Getter
  @Setter
  public static class Vnpay {
    private String tmnCode = "VNPAYDEMO";
    private String hashSecret = "";
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  }
}
