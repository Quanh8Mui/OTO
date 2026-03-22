package com.garage.oto.repository;

import com.garage.oto.domain.PartsRequest;
import com.garage.oto.domain.PartsRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartsRequestRepository extends JpaRepository<PartsRequest, Long> {

  long countByStatus(PartsRequestStatus status);

  Optional<PartsRequest> findByRequestNumber(String requestNumber);

  List<PartsRequest> findByRepairOrderIdOrderByCreatedAtDesc(Long repairOrderId);
}
