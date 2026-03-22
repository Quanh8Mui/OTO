package com.garage.oto.dto.parts;

import com.garage.oto.domain.PartsRequestStatus;
import java.time.Instant;
import java.util.List;

public record PartsRequestResponse(
    Long id,
    String requestNumber,
    Long repairOrderId,
    Long requestedByStaffId,
    PartsRequestStatus status,
    String adminNote,
    Instant createdAt,
    Instant fulfilledAt,
    List<PartsRequestLineResponse> lines) {}
