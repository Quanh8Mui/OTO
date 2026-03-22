package com.garage.oto.dto.auth;

import com.garage.oto.domain.Role;

public record AuthResponse(
    String token, Long userId, String email, String fullName, Role role) {}
