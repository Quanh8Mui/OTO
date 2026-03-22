package com.garage.oto.dto.quote;

import com.garage.oto.domain.QuoteStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record QuoteResponse(
    Long id,
    String quoteNumber,
    Long repairOrderId,
    int version,
    QuoteStatus status,
    BigDecimal laborTotal,
    BigDecimal partsTotal,
    BigDecimal taxRate,
    BigDecimal taxAmount,
    BigDecimal grandTotal,
    String staffNotes,
    String customerResponseNote,
    Instant createdAt,
    Instant sentAt,
    Instant approvedAt,
    Instant rejectedAt,
    String rejectedReason,
    List<QuoteLineResponse> lines) {}
