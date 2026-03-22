package com.garage.oto.web;

import com.garage.oto.dto.parts.PartsRequestResponse;
import com.garage.oto.dto.parts.PartsRequestReviewRequest;
import com.garage.oto.service.PartsRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/parts-requests")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPartsRequestController {

  private final PartsRequestService partsRequestService;

  @GetMapping("/pending")
  public List<PartsRequestResponse> pending() {
    return partsRequestService.listPending();
  }

  @PostMapping("/{id}/approve")
  public PartsRequestResponse approve(
      @PathVariable Long id, @RequestBody(required = false) PartsRequestReviewRequest req) {
    return partsRequestService.approve(id, req != null ? req : new PartsRequestReviewRequest(null));
  }

  @PostMapping("/{id}/reject")
  public PartsRequestResponse reject(
      @PathVariable Long id, @RequestBody(required = false) PartsRequestReviewRequest req) {
    return partsRequestService.reject(id, req != null ? req : new PartsRequestReviewRequest(null));
  }

  @PostMapping("/{id}/fulfill")
  public PartsRequestResponse fulfill(
      @PathVariable Long id, @RequestBody(required = false) PartsRequestReviewRequest req) {
    return partsRequestService.fulfill(id, req != null ? req : new PartsRequestReviewRequest(null));
  }
}
