package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.schedule.StaffScheduleRequest;
import com.garage.oto.dto.schedule.StaffScheduleResponse;
import com.garage.oto.service.StaffScheduleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/schedules")
@PreAuthorize("hasRole('STAFF')")
@RequiredArgsConstructor
public class StaffScheduleController {

  private final StaffScheduleService staffScheduleService;

  @GetMapping
  public List<StaffScheduleResponse> list(
      @AuthenticationPrincipal User user, @RequestParam(required = false) Long staffUserId) {
    if (staffUserId != null) {
      return staffScheduleService.listForStaffId(staffUserId);
    }
    return staffScheduleService.listForStaff(user);
  }

  @PostMapping
  public StaffScheduleResponse upsert(
      @AuthenticationPrincipal User user, @Valid @RequestBody StaffScheduleRequest req) {
    return staffScheduleService.upsert(user, req);
  }

  @DeleteMapping("/{id}")
  public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
    staffScheduleService.delete(user, id);
  }
}
