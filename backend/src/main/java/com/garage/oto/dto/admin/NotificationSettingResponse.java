package com.garage.oto.dto.admin;

public record NotificationSettingResponse(
    Long id, String eventKey, boolean enabled, String channel, String templateSubject, String templateBody) {}
