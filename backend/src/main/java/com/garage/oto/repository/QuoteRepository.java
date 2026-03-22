package com.garage.oto.repository;

import com.garage.oto.domain.Quote;
import com.garage.oto.domain.QuoteStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

  Optional<Quote> findByQuoteNumber(String quoteNumber);

  List<Quote> findByRepairOrderIdOrderByVersionDesc(Long repairOrderId);

  List<Quote> findByRepairOrder_Customer_IdOrderByCreatedAtDesc(Long customerId);

  List<Quote> findByRepairOrder_Customer_IdAndStatusInOrderByCreatedAtDesc(
      Long customerId, List<QuoteStatus> statuses);
}
