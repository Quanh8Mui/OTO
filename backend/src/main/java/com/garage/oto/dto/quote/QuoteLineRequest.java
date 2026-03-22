package com.garage.oto.dto.quote;

import com.garage.oto.domain.QuoteLineType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record QuoteLineRequest(
    @NotNull QuoteLineType lineType,
    Long serviceCatalogId,
    Long partId,
    @NotBlank String description,
    @NotNull BigDecimal quantity,
    @NotNull BigDecimal unitPrice) {}
