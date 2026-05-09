package com.garage.oto.repository;

import com.garage.oto.domain.RepairProgressEvent;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairProgressEventRepository extends JpaRepository<RepairProgressEvent, Long> {

  @EntityGraph(attributePaths = {"createdBy"})
  List<RepairProgressEvent> findByRepairOrderIdOrderByCreatedAtAsc(Long repairOrderId);

  @EntityGraph(attributePaths = {"createdBy"})
  List<RepairProgressEvent> findByRepairOrderIdOrderByCreatedAtDesc(Long repairOrderId);
}
