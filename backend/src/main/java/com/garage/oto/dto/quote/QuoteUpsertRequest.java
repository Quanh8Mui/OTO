package com.garage.oto.dto.quote;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record QuoteUpsertRequest(
    @NotNull BigDecimal taxRate,
    String staffNotes,
    @NotEmpty @Valid List<QuoteLineRequest> lines) {}
