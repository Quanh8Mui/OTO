package com.garage.oto.dto.parts;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PartsRequestLineDto(@NotNull Long partId, @NotNull @Min(1) int quantityRequested) {}
