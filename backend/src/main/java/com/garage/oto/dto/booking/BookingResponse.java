package com.garage.oto.dto.booking;

import com.garage.oto.domain.BookingStatus;
import com.garage.oto.domain.QuoteStatus;
import com.garage.oto.domain.RepairOrderStatus;
import java.time.Instant;
import java.time.LocalDate;

public record BookingResponse(
    Long id,
    Long customerId,
    String customerName,
    String customerPhone,
    String bookingNumber,
    Long vehicleId,
    String licensePlate,
    String vehicleLabel,
    Long serviceCatalogId,
    String serviceName,
    String serviceTypeLabel,
    LocalDate requestedDate,
    String timeSlot,
    String notes,
    BookingStatus status,
    Long repairOrderId,
    String repairOrderNumber,
    RepairOrderStatus repairOrderStatus,
    Long assignedStaffId,
    String assignedStaffName,
    QuoteStatus quoteStatus,
    String quoteRejectedReason,
    Instant createdAt) {}
