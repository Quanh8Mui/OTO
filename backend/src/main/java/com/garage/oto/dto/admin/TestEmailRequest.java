package com.garage.oto.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TestEmailRequest(
    @NotBlank @Email String toEmail
) {}
