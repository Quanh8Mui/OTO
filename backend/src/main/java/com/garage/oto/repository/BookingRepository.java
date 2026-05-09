package com.garage.oto.repository;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  @Query(
      "SELECT b FROM Booking b "
          + "JOIN FETCH b.customer "
          + "JOIN FETCH b.vehicle "
          + "LEFT JOIN FETCH b.serviceCatalog "
          + "WHERE b.customer.id = :customerId "
          + "ORDER BY b.requestedDate DESC, b.createdAt DESC")
  List<Booking> findByCustomerIdOrderByRequestedDateDescCreatedAtDesc(@Param("customerId") Long customerId);

  @Query(
      "SELECT b FROM Booking b "
          + "JOIN FETCH b.customer "
          + "JOIN FETCH b.vehicle "
          + "LEFT JOIN FETCH b.serviceCatalog "
          + "WHERE b.status = :status "
          + "ORDER BY b.createdAt DESC")
  List<Booking> findAllByStatusOrderByCreatedAtDesc(@Param("status") BookingStatus status);
}
