package com.garage.oto.web;

import com.garage.oto.dto.admin.DashboardResponse;
import com.garage.oto.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

  private final DashboardService dashboardService;

  @GetMapping
  public DashboardResponse overview() {
    return dashboardService.overview();
  }
}
