package com.garage.oto.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentCompleteRequest(@NotBlank String transactionRef) {}
