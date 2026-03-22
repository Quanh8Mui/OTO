package com.garage.oto.dto.auth;

import com.garage.oto.domain.Role;

public record UserMeResponse(Long id, String email, String fullName, String phone, Role role) {}
