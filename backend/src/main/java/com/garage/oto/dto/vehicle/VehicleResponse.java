package com.garage.oto.dto.vehicle;

import java.time.Instant;

public record VehicleResponse(
    Long id,
    String licensePlate,
    String brand,
    String model,
    Integer year,
    String vin,
    String color,
    Instant createdAt) {}
