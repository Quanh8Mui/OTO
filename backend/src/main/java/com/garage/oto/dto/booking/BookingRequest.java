package com.garage.oto.dto.booking;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BookingRequest(
    @NotNull Long vehicleId,
    Long serviceCatalogId,
    String serviceTypeLabel,
    @NotNull LocalDate requestedDate,
    String timeSlot,
    String notes) {}
