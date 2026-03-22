package com.garage.oto.dto.admin;

public record EmployeeResponse(
    Long id, Long userId, String email, String fullName, String phone, String employeeCode, String position) {}
