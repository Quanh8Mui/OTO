package com.garage.oto.repository;

import com.garage.oto.domain.Vehicle;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

  List<Vehicle> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

  boolean existsByCustomerIdAndLicensePlateIgnoreCase(Long customerId, String licensePlate);
}
