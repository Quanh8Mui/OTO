package com.garage.oto.repository;

import com.garage.oto.domain.Payment;
import com.garage.oto.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

  List<Payment> findByRepairOrder_Customer_IdOrderByCreatedAtDesc(Long customerId);

  List<Payment> findByRepairOrderIdOrderByCreatedAtDesc(Long repairOrderId);

  @Query(
      "SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status "
          + "AND p.paidAt >= :from AND p.paidAt < :to")
  BigDecimal sumAmountByStatusAndPaidAtBetween(
      @Param("status") PaymentStatus status,
      @Param("from") Instant from,
      @Param("to") Instant to);

  @Query(
      "SELECT COUNT(p) FROM Payment p WHERE p.status = :status AND p.paidAt >= :from AND p.paidAt < :to")
  long countByStatusAndPaidAtBetween(
      @Param("status") PaymentStatus status,
      @Param("from") Instant from,
      @Param("to") Instant to);

  @Query(
      "SELECT CAST(p.paidAt AS LocalDate) AS day, COALESCE(SUM(p.amount), 0), COUNT(p) "
          + "FROM Payment p WHERE p.status = :status AND p.paidAt >= :from AND p.paidAt < :to "
          + "GROUP BY CAST(p.paidAt AS LocalDate) ORDER BY day")
  java.util.List<Object[]> dailyRevenue(
      @Param("status") PaymentStatus status,
      @Param("from") Instant from,
      @Param("to") Instant to);
}
