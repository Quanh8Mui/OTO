package com.garage.oto.repository;

import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {

  long countByStatus(RepairOrderStatus status);

  Optional<RepairOrder> findByOrderNumber(String orderNumber);

  @EntityGraph(attributePaths = {"booking", "customer", "vehicle", "assignedStaff"})
  List<RepairOrder> findAllByOrderByUpdatedAtDesc();

  @EntityGraph(attributePaths = {"booking", "customer", "vehicle", "assignedStaff"})
  List<RepairOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

  @EntityGraph(attributePaths = {"booking", "customer", "vehicle", "assignedStaff"})
  List<RepairOrder> findByAssignedStaffIdOrderByCreatedAtDesc(Long staffId);

  @EntityGraph(attributePaths = {"booking", "customer", "vehicle", "assignedStaff"})
  Optional<RepairOrder> findWithRelationsById(Long id);

  @EntityGraph(attributePaths = {"booking", "customer", "vehicle", "assignedStaff"})
  @Query(
      "SELECT r FROM RepairOrder r WHERE r.status IN :statuses ORDER BY r.updatedAt DESC")
  List<RepairOrder> findByStatusIn(@Param("statuses") List<RepairOrderStatus> statuses);

  @Query(
      "SELECT COUNT(r) FROM RepairOrder r WHERE r.createdAt >= :from AND r.createdAt < :to")
  long countCreatedBetween(@Param("from") Instant from, @Param("to") Instant to);

  @Query(
      "SELECT r FROM RepairOrder r WHERE r.status = :status AND r.updatedAt >= :from AND r.updatedAt < :to")
  List<RepairOrder> findDeliveredBetween(
      @Param("status") RepairOrderStatus status,
      @Param("from") Instant from,
      @Param("to") Instant to);
}
