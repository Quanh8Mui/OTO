package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.repair.ProgressEventResponse;
import com.garage.oto.dto.repair.RepairOrderResponse;
import com.garage.oto.service.RepairOrderService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/repair-orders")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerRepairController {

  private final RepairOrderService repairOrderService;

  @GetMapping
  public List<RepairOrderResponse> list(@AuthenticationPrincipal User user) {
    return repairOrderService.listForCustomer(user);
  }

  @GetMapping("/{id}")
  public RepairOrderResponse get(
      @AuthenticationPrincipal User user, @PathVariable Long id) {
    return repairOrderService.getForCustomer(user, id);
  }

  @GetMapping("/{id}/progress")
  public List<ProgressEventResponse> progress(
      @AuthenticationPrincipal User user, @PathVariable Long id) {
    return repairOrderService.listProgressForCustomer(user, id);
  }
}
