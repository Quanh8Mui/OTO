package com.garage.oto.web;

import com.garage.oto.domain.Role;
import com.garage.oto.domain.User;
import com.garage.oto.dto.booking.BookingResponse;
import com.garage.oto.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/bookings")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
@RequiredArgsConstructor
public class StaffBookingController {

  private final BookingService bookingService;

  @GetMapping
  public List<BookingResponse> list(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) String scope) {
    if ("pending".equalsIgnoreCase(scope)) {
      return bookingService.listPending();
    }
    if ("all".equalsIgnoreCase(scope) || user.getRole() == Role.ADMIN) {
      return bookingService.listAll();
    }
    return bookingService.listForStaff(user);
  }
}
