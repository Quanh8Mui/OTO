package com.garage.oto.dto.catalog;

import java.math.BigDecimal;

public record PublicPartResponse(Long id, String sku, String name, BigDecimal unitPrice) {}
