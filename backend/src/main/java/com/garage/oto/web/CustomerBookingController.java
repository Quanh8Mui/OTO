package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.booking.BookingRequest;
import com.garage.oto.dto.booking.BookingResponse;
import com.garage.oto.service.BookingService;
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
@RequestMapping("/api/customer/bookings")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerBookingController {

  private final BookingService bookingService;

  @GetMapping
  public List<BookingResponse> list(@AuthenticationPrincipal User user) {
    return bookingService.list(user);
  }

  @PostMapping
  public BookingResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody BookingRequest req) {
    return bookingService.create(user, req);
  }
}
