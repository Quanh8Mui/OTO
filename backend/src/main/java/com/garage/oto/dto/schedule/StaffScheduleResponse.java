package com.garage.oto.dto.schedule;

import java.time.LocalTime;

public record StaffScheduleResponse(Long id, int dayOfWeek, LocalTime startTime, LocalTime endTime) {}
