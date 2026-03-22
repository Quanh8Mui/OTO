package com.garage.oto.dto.payment;

import com.garage.oto.domain.PaymentMethod;
import com.garage.oto.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
    Long id,
    String paymentNumber,
    Long repairOrderId,
    Long quoteId,
    BigDecimal amount,
    PaymentMethod method,
    PaymentStatus status,
    String transactionRef,
    Instant paidAt,
    Instant createdAt) {}
