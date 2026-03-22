package com.garage.oto.dto.admin;

import java.math.BigDecimal;

public record ServiceCatalogResponse(
    Long id, String code, String name, String description, BigDecimal basePrice, boolean active) {}
