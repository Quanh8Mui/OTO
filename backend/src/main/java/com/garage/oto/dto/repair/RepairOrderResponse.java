package com.garage.oto.dto.repair;

import com.garage.oto.domain.RepairOrderStatus;
import java.time.Instant;

public record RepairOrderResponse(
    Long id,
    String orderNumber,
    Long bookingId,
    Long customerId,
    String customerName,
    Long vehicleId,
    String licensePlate,
    String vehicleLabel,
    Long assignedStaffId,
    String assignedStaffName,
    RepairOrderStatus status,
    String intakeNotes,
    String progressNotes,
    Instant createdAt,
    Instant updatedAt) {}
