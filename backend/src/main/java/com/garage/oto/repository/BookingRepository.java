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

  @Query(
      "SELECT COUNT(b) > 0 FROM Booking b "
          + "WHERE b.vehicle.id = :vehicleId "
          + "AND b.requestedDate = :requestedDate "
          + "AND (b.status = com.garage.oto.domain.BookingStatus.PENDING "
          + "OR (b.status = com.garage.oto.domain.BookingStatus.CONFIRMED "
          + "AND NOT EXISTS ("
          + "SELECT ro FROM RepairOrder ro WHERE ro.booking = b AND ro.status IN ("
          + "com.garage.oto.domain.RepairOrderStatus.DELIVERED, com.garage.oto.domain.RepairOrderStatus.CANCELLED))))")
  boolean existsActiveBookingForVehicleOnDate(
      @Param("vehicleId") Long vehicleId,
      @Param("requestedDate") java.time.LocalDate requestedDate);
}
