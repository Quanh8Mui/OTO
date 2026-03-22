package com.garage.oto.repository;

import com.garage.oto.domain.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  List<Booking> findByCustomerIdOrderByRequestedDateDescCreatedAtDesc(Long customerId);
}
