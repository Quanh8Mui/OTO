package com.garage.oto.web;

import com.garage.oto.dto.rating.ServiceRatingResponse;
import com.garage.oto.service.ServiceRatingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ratings")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class AdminRatingController {

  private final ServiceRatingService serviceRatingService;

  @GetMapping
  public List<ServiceRatingResponse> list() {
    return serviceRatingService.listAll();
  }
}
