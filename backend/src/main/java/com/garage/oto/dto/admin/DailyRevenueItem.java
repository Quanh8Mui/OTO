package com.garage.oto.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueItem(LocalDate date, BigDecimal revenue, long paymentCount) {}
