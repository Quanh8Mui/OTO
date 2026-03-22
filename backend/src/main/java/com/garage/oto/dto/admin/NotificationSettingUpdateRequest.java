package com.garage.oto.dto.admin;

import jakarta.validation.constraints.NotNull;

public record NotificationSettingUpdateRequest(
    @NotNull Boolean enabled,
    String channel,
    String templateSubject,
    String templateBody) {}
