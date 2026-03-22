package com.garage.oto.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardResponse(
    Map<String, Long> ordersByStatus,
    BigDecimal revenueToday,
    long lowStockPartsCount,
    long pendingPartsRequests) {}
