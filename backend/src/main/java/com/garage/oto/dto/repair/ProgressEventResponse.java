package com.garage.oto.dto.repair;

import java.time.Instant;

public record ProgressEventResponse(
    Long id, String message, String stepLabel, String createdByName, Instant createdAt) {}
