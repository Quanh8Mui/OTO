package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.repair.RepairIntakeRequest;
import com.garage.oto.dto.repair.ProgressEventResponse;
import com.garage.oto.dto.repair.RepairOrderResponse;
import com.garage.oto.dto.repair.RepairProgressRequest;
import com.garage.oto.dto.repair.RepairStatusUpdateRequest;
import com.garage.oto.service.RepairOrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/repair-orders")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
@RequiredArgsConstructor
public class StaffRepairController {

  private final RepairOrderService repairOrderService;

  @GetMapping
  public List<RepairOrderResponse> list(
      @AuthenticationPrincipal User user,
      @RequestParam(defaultValue = "all") String scope) {
    if ("mine".equalsIgnoreCase(scope)) {
      return repairOrderService.listForStaff(user);
    }
    return repairOrderService.listAllOrders();
  }

  @GetMapping("/{id}")
  public RepairOrderResponse get(@PathVariable Long id) {
    return repairOrderService.getById(id);
  }

  @PostMapping("/intake")
  public RepairOrderResponse intake(
      @AuthenticationPrincipal User user, @Valid @RequestBody RepairIntakeRequest req) {
    return repairOrderService.intake(user, req);
  }

  @PutMapping("/{id}/status")
  public RepairOrderResponse updateStatus(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @Valid @RequestBody RepairStatusUpdateRequest req) {
    return repairOrderService.updateStatus(user, id, req);
  }

  @PostMapping("/{id}/progress")
  public void addProgress(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @Valid @RequestBody RepairProgressRequest req) {
    repairOrderService.addProgress(user, id, req);
  }

  @GetMapping("/{id}/progress")
  public List<ProgressEventResponse> progress(@PathVariable Long id) {
    return repairOrderService.listProgress(id);
  }

  @PostMapping("/{id}/complete-work")
  public RepairOrderResponse completeWork(
      @AuthenticationPrincipal User user, @PathVariable Long id) {
    return repairOrderService.markWorkCompleted(user, id);
  }

  @PostMapping("/{id}/handover")
  public RepairOrderResponse handover(
      @AuthenticationPrincipal User user, @PathVariable Long id) {
    return repairOrderService.handoverVehicle(user, id);
  }
}
