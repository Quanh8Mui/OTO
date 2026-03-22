package com.garage.oto.dto.repair;

import com.garage.oto.domain.RepairOrderStatus;
import jakarta.validation.constraints.NotNull;

public record RepairStatusUpdateRequest(@NotNull RepairOrderStatus status, String progressNotes) {}
