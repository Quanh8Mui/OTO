package com.garage.oto.dto.rating;

import java.time.Instant;

public record ServiceRatingResponse(
    Long id,
    Long repairOrderId,
    String orderNumber,
    String licensePlate,
    String customerName,
    int rating,
    String comment,
    Instant createdAt) {}
