package com.garage.oto.dto.booking;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BookingRequest(
    Long vehicleId,
    String licensePlate,
    String brand,
    String model,
    Integer year,
    String vin,
    String color,
    Long serviceCatalogId,
    String serviceTypeLabel,
    @NotNull LocalDate requestedDate,
    String timeSlot,
    String notes) {}
