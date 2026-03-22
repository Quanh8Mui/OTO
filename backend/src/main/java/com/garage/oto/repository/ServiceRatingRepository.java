package com.garage.oto.repository;

import com.garage.oto.domain.ServiceRating;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRatingRepository extends JpaRepository<ServiceRating, Long> {

  Optional<ServiceRating> findByRepairOrderId(Long repairOrderId);

  List<ServiceRating> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
