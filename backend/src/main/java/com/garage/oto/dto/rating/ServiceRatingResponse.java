package com.garage.oto.dto.rating;

import java.time.Instant;

public record ServiceRatingResponse(
    Long id, Long repairOrderId, int rating, String comment, Instant createdAt) {}
