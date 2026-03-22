package com.garage.oto.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PartRequest(
    @NotBlank String sku,
    @NotBlank String name,
    String description,
    @NotNull BigDecimal unitPrice,
    @NotNull Integer quantityOnHand,
    @NotNull Integer minStock,
    String category,
    boolean active) {}
