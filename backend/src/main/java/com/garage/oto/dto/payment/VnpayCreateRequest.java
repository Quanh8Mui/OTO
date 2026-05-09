package com.garage.oto.dto.payment;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record VnpayCreateRequest(
    @NotNull Long repairOrderId, Long quoteId, @NotNull BigDecimal amount, String orderInfo) {}
