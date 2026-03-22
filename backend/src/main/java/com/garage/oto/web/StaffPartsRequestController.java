package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.parts.PartsRequestCreateRequest;
import com.garage.oto.dto.parts.PartsRequestResponse;
import com.garage.oto.service.PartsRequestService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('STAFF')")
@RequiredArgsConstructor
public class StaffPartsRequestController {

  private final PartsRequestService partsRequestService;

  @GetMapping("/repair-orders/{repairOrderId}/parts-requests")
  public List<PartsRequestResponse> listForOrder(@PathVariable Long repairOrderId) {
    return partsRequestService.listForRepairOrder(repairOrderId);
  }

  @PostMapping("/parts-requests")
  public PartsRequestResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody PartsRequestCreateRequest req) {
    return partsRequestService.create(user, req);
  }
}
