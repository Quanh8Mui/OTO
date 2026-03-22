package com.garage.oto.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ServiceCatalogRequest(
    @NotBlank String code,
    @NotBlank String name,
    String description,
    @NotNull BigDecimal basePrice,
    boolean active) {}
