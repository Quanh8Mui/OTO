package com.garage.oto.repository;

import com.garage.oto.domain.PartsRequest;
import com.garage.oto.domain.PartsRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartsRequestRepository extends JpaRepository<PartsRequest, Long> {

  long countByStatus(PartsRequestStatus status);

  Optional<PartsRequest> findByRequestNumber(String requestNumber);

  @EntityGraph(attributePaths = {"repairOrder", "requestedByStaff", "lines", "lines.part"})
  List<PartsRequest> findByRepairOrderIdOrderByCreatedAtDesc(Long repairOrderId);

  @EntityGraph(attributePaths = {"repairOrder", "requestedByStaff", "lines", "lines.part"})
  Optional<PartsRequest> findWithRelationsById(Long id);
}
