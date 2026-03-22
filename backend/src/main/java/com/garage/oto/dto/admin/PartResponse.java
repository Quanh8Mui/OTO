package com.garage.oto.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;

public record PartResponse(
    Long id,
    String sku,
    String name,
    String description,
    BigDecimal unitPrice,
    int quantityOnHand,
    int minStock,
    String category,
    boolean active,
    Instant updatedAt) {}
