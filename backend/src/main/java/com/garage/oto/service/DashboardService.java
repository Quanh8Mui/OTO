package com.garage.oto.service;

import com.garage.oto.domain.PartsRequestStatus;
import com.garage.oto.domain.PaymentStatus;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.dto.admin.DashboardResponse;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.PartsRequestRepository;
import com.garage.oto.repository.PaymentRepository;
import com.garage.oto.repository.RepairOrderRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

  private final RepairOrderRepository repairOrderRepository;
  private final PaymentRepository paymentRepository;
  private final PartRepository partRepository;
  private final PartsRequestRepository partsRequestRepository;

  public DashboardService(
      RepairOrderRepository repairOrderRepository,
      PaymentRepository paymentRepository,
      PartRepository partRepository,
      PartsRequestRepository partsRequestRepository) {
    this.repairOrderRepository = repairOrderRepository;
    this.paymentRepository = paymentRepository;
    this.partRepository = partRepository;
    this.partsRequestRepository = partsRequestRepository;
  }

  public DashboardResponse overview() {
    Map<String, Long> byStatus = new HashMap<>();
    for (RepairOrderStatus s : RepairOrderStatus.values()) {
      byStatus.put(s.name(), repairOrderRepository.countByStatus(s));
    }
    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    Instant start = today.atStartOfDay(ZoneOffset.UTC).toInstant();
    Instant end = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    BigDecimal revenueToday =
        paymentRepository.sumAmountByStatusAndPaidAtBetween(PaymentStatus.COMPLETED, start, end);
    long lowStock =
        partRepository.findAll().stream()
            .filter(p -> p.isActive() && p.getQuantityOnHand() <= p.getMinStock())
            .count();
    long pendingPr = partsRequestRepository.countByStatus(PartsRequestStatus.PENDING);
    return new DashboardResponse(byStatus, revenueToday, lowStock, pendingPr);
  }
}
