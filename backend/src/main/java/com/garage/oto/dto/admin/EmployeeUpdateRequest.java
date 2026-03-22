package com.garage.oto.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmployeeUpdateRequest(
    @NotBlank @Email String email,
    String password,
    @NotBlank String fullName,
    String phone,
    @NotBlank String employeeCode,
    String position) {}
