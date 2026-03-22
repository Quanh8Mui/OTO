package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.auth.AuthResponse;
import com.garage.oto.dto.auth.LoginRequest;
import com.garage.oto.dto.auth.RegisterRequest;
import com.garage.oto.dto.auth.UserMeResponse;
import com.garage.oto.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
    return authService.register(req);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
    return authService.login(req);
  }

  @GetMapping("/me")
  public UserMeResponse me(@AuthenticationPrincipal User user) {
    return authService.me(user);
  }
}
