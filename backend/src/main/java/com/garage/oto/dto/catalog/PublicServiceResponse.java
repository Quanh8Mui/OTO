package com.garage.oto.dto.catalog;

import java.math.BigDecimal;

public record PublicServiceResponse(
    Long id, String code, String name, String description, BigDecimal basePrice) {}
