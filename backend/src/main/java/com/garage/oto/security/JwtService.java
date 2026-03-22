package com.garage.oto.security;

import com.garage.oto.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final AppProperties appProperties;

  public JwtService(AppProperties appProperties) {
    this.appProperties = appProperties;
  }

  public String generateToken(String subjectEmail) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + appProperties.getJwt().getExpirationMs());
    return Jwts.builder()
        .subject(subjectEmail)
        .issuedAt(now)
        .expiration(exp)
        .signWith(signingKey())
        .compact();
  }

  public String extractEmail(String token) {
    return parseClaims(token).getSubject();
  }

  public boolean isTokenValid(String token, String expectedEmail) {
    try {
      String email = extractEmail(token);
      Date exp = parseClaims(token).getExpiration();
      return email.equals(expectedEmail) && exp.after(new Date());
    } catch (Exception e) {
      return false;
    }
  }

  private Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token).getPayload();
  }

  private SecretKey signingKey() {
    byte[] raw = appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
    if (raw.length < 32) {
      raw = Arrays.copyOf(raw, 32);
    }
    return Keys.hmacShaKeyFor(raw);
  }
}
