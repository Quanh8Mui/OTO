package com.garage.oto.dto.parts;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PartsRequestCreateRequest(
    @NotNull Long repairOrderId, @NotEmpty @Valid List<PartsRequestLineDto> lines) {}
