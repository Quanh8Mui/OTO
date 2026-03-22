package com.garage.oto.dto.quote;

import com.garage.oto.domain.QuoteLineType;
import java.math.BigDecimal;

public record QuoteLineResponse(
    Long id,
    QuoteLineType lineType,
    Long serviceCatalogId,
    Long partId,
    String description,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal lineTotal) {}
