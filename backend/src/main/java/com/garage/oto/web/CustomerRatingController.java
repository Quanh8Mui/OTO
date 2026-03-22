package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.rating.ServiceRatingRequest;
import com.garage.oto.dto.rating.ServiceRatingResponse;
import com.garage.oto.service.ServiceRatingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/ratings")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerRatingController {

  private final ServiceRatingService serviceRatingService;

  @GetMapping
  public List<ServiceRatingResponse> list(@AuthenticationPrincipal User user) {
    return serviceRatingService.listForCustomer(user);
  }

  @PostMapping
  public ServiceRatingResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody ServiceRatingRequest req) {
    return serviceRatingService.create(user, req);
  }
}
