package com.garage.oto.web;

import com.garage.oto.dto.admin.RevenueReportResponse;
import com.garage.oto.service.RevenueService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/revenue")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRevenueController {

  private final RevenueService revenueService;

  @GetMapping
  public RevenueReportResponse report(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    LocalDate f = from != null ? from : LocalDate.now(ZoneOffset.UTC).minusMonths(1);
    LocalDate t = to != null ? to : LocalDate.now(ZoneOffset.UTC);
    Instant start = f.atStartOfDay(ZoneOffset.UTC).toInstant();
    Instant end = t.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    return revenueService.report(start, end);
  }
}
