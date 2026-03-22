package com.garage.oto.service;

import com.garage.oto.domain.User;
import com.garage.oto.domain.Vehicle;
import com.garage.oto.dto.vehicle.VehicleRequest;
import com.garage.oto.dto.vehicle.VehicleResponse;
import com.garage.oto.repository.VehicleRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

  private final VehicleRepository vehicleRepository;

  public VehicleService(VehicleRepository vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  public List<VehicleResponse> list(User customer) {
    return vehicleRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
        .map(VehicleService::toResponse)
        .toList();
  }

  @Transactional
  public VehicleResponse create(User customer, VehicleRequest req) {
    if (vehicleRepository.existsByCustomerIdAndLicensePlateIgnoreCase(
        customer.getId(), req.licensePlate())) {
      throw new ApiException(HttpStatus.CONFLICT, "Vehicle with this plate already exists");
    }
    Vehicle v = new Vehicle();
    v.setCustomer(customer);
    v.setLicensePlate(req.licensePlate().trim().toUpperCase());
    v.setBrand(req.brand());
    v.setModel(req.model());
    v.setYear(req.year());
    v.setVin(req.vin());
    v.setColor(req.color());
    vehicleRepository.save(v);
    return toResponse(v);
  }

  @Transactional
  public VehicleResponse update(User customer, Long id, VehicleRequest req) {
    Vehicle v = vehicleRepository.findById(id).orElseThrow(() -> notFound());
    if (!v.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your vehicle");
    }
    v.setLicensePlate(req.licensePlate().trim().toUpperCase());
    v.setBrand(req.brand());
    v.setModel(req.model());
    v.setYear(req.year());
    v.setVin(req.vin());
    v.setColor(req.color());
    return toResponse(v);
  }

  @Transactional
  public void delete(User customer, Long id) {
    Vehicle v = vehicleRepository.findById(id).orElseThrow(() -> notFound());
    if (!v.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your vehicle");
    }
    vehicleRepository.delete(v);
  }

  public Vehicle getOwnedVehicle(User customer, Long vehicleId) {
    Vehicle v = vehicleRepository.findById(vehicleId).orElseThrow(() -> notFound());
    if (!v.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your vehicle");
    }
    return v;
  }

  private static VehicleResponse toResponse(Vehicle v) {
    return new VehicleResponse(
        v.getId(),
        v.getLicensePlate(),
        v.getBrand(),
        v.getModel(),
        v.getYear(),
        v.getVin(),
        v.getColor(),
        v.getCreatedAt());
  }

  private static ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Vehicle not found");
  }
}
