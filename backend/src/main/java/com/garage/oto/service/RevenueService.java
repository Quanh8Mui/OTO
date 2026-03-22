package com.garage.oto.service;

import com.garage.oto.domain.PaymentStatus;
import com.garage.oto.dto.admin.RevenueReportResponse;
import com.garage.oto.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class RevenueService {

  private final PaymentRepository paymentRepository;

  public RevenueService(PaymentRepository paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  public RevenueReportResponse report(Instant from, Instant to) {
    BigDecimal total =
        paymentRepository.sumAmountByStatusAndPaidAtBetween(PaymentStatus.COMPLETED, from, to);
    int cnt =
        (int)
            paymentRepository.countByStatusAndPaidAtBetween(PaymentStatus.COMPLETED, from, to);
    return new RevenueReportResponse(from, to, total, cnt);
  }
}
