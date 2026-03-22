package com.garage.oto.dto.payment;

import com.garage.oto.domain.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PaymentCreateRequest(
    @NotNull Long repairOrderId, Long quoteId, @NotNull BigDecimal amount, @NotNull PaymentMethod method) {}
