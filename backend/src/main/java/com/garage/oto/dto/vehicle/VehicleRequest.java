package com.garage.oto.dto.vehicle;

import jakarta.validation.constraints.NotBlank;

public record VehicleRequest(
    @NotBlank String licensePlate,
    String brand,
    String model,
    Integer year,
    String vin,
    String color) {}
