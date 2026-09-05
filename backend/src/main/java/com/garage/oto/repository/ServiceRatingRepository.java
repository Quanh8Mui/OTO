package com.garage.oto.repository;

import com.garage.oto.domain.ServiceRating;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceRatingRepository extends JpaRepository<ServiceRating, Long> {

  Optional<ServiceRating> findByRepairOrderId(Long repairOrderId);

  @Query("SELECT r FROM ServiceRating r "
       + "JOIN FETCH r.customer "
       + "JOIN FETCH r.repairOrder ro "
       + "LEFT JOIN FETCH ro.vehicle "
       + "WHERE r.customer.id = :customerId "
       + "ORDER BY r.createdAt DESC")
  List<ServiceRating> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);

  @Query("SELECT r FROM ServiceRating r "
       + "JOIN FETCH r.customer "
       + "JOIN FETCH r.repairOrder ro "
       + "LEFT JOIN FETCH ro.vehicle "
       + "ORDER BY r.createdAt DESC")
  List<ServiceRating> findAllByOrderByCreatedAtDesc();
}

