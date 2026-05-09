package com.garage.oto.service;

import com.garage.oto.domain.Role;
import com.garage.oto.domain.User;
import com.garage.oto.dto.auth.AuthResponse;
import com.garage.oto.dto.auth.ChangePasswordRequest;
import com.garage.oto.dto.auth.LoginRequest;
import com.garage.oto.dto.auth.RegisterRequest;
import com.garage.oto.dto.auth.UserMeResponse;
import com.garage.oto.repository.UserRepository;
import com.garage.oto.security.JwtService;
import com.garage.oto.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      AuthenticationManager authenticationManager) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
  }

  @Transactional
  public AuthResponse register(RegisterRequest req) {
    if (userRepository.existsByEmailIgnoreCase(req.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
    }
    User u = new User();
    u.setEmail(req.email().trim().toLowerCase());
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    u.setFullName(req.fullName().trim());
    u.setPhone(req.phone());
    u.setRole(Role.CUSTOMER);
    u.setActive(true);
    userRepository.save(u);
    String token = jwtService.generateToken(u.getEmail());
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getFullName(), u.getRole());
  }

  public AuthResponse login(LoginRequest req) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email().trim().toLowerCase(), req.password()));
    User u =
        userRepository
            .findByEmailIgnoreCase(req.email().trim().toLowerCase())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    String token = jwtService.generateToken(u.getEmail());
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getFullName(), u.getRole());
  }

  @Transactional
  public void changePassword(User user, ChangePasswordRequest req) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(user.getEmail(), req.currentPassword()));
    user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
    userRepository.save(user);
  }

  public UserMeResponse me(User user) {
    return new UserMeResponse(
        user.getId(), user.getEmail(), user.getFullName(), user.getPhone(), user.getRole());
  }
}
