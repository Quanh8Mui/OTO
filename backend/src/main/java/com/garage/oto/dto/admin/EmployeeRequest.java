package com.garage.oto.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(
    @NotBlank @Email String email,
    @Size(min = 6, max = 100) String password,
    @NotBlank String fullName,
    String phone,
    String employeeCode,
    String position) {}
