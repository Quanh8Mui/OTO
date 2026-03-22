package com.garage.oto.repository;

import com.garage.oto.domain.RepairProgressEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairProgressEventRepository extends JpaRepository<RepairProgressEvent, Long> {

  List<RepairProgressEvent> findByRepairOrderIdOrderByCreatedAtAsc(Long repairOrderId);
}
