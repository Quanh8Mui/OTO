package com.garage.oto.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;

public record RevenueReportResponse(Instant from, Instant to, BigDecimal totalRevenue, int paymentCount) {}
