package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.vehicle.VehicleRequest;
import com.garage.oto.dto.vehicle.VehicleResponse;
import com.garage.oto.service.VehicleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/vehicles")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerVehicleController {

  private final VehicleService vehicleService;

  @GetMapping
  public List<VehicleResponse> list(@AuthenticationPrincipal User user) {
    return vehicleService.list(user);
  }

  @PostMapping
  public VehicleResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody VehicleRequest req) {
    return vehicleService.create(user, req);
  }

  @PutMapping("/{id}")
  public VehicleResponse update(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @Valid @RequestBody VehicleRequest req) {
    return vehicleService.update(user, id, req);
  }

  @DeleteMapping("/{id}")
  public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
    vehicleService.delete(user, id);
  }
}
