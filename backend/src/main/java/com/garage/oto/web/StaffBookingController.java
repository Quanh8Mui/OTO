package com.garage.oto.web;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.garage.oto.dto.booking.BookingResponse;
import com.garage.oto.service.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff/bookings")
@PreAuthorize("hasRole('STAFF')")
@RequiredArgsConstructor
public class StaffBookingController {

  private final BookingService bookingService;

  @GetMapping
  public List<BookingResponse> listPending() {
    return bookingService.listPending();
  }
}
