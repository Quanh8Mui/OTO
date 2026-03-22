package com.garage.oto.dto.booking;

import com.garage.oto.domain.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;

public record BookingResponse(
    Long id,
    String bookingNumber,
    Long vehicleId,
    String licensePlate,
    Long serviceCatalogId,
    String serviceName,
    String serviceTypeLabel,
    LocalDate requestedDate,
    String timeSlot,
    String notes,
    BookingStatus status,
    Instant createdAt) {}
