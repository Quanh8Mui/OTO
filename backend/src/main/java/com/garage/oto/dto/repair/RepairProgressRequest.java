package com.garage.oto.dto.repair;

import jakarta.validation.constraints.NotBlank;

public record RepairProgressRequest(@NotBlank String message, String stepLabel) {}
