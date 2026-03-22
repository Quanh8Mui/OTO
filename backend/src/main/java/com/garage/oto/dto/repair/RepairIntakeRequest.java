package com.garage.oto.dto.repair;

import jakarta.validation.constraints.NotNull;

public record RepairIntakeRequest(
    @NotNull Long customerId,
    @NotNull Long vehicleId,
    Long bookingId,
    Long assignedStaffId,
    String intakeNotes) {}
