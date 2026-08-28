package com.garage.oto.service;

import com.garage.oto.domain.PaymentStatus;
import com.garage.oto.dto.admin.DailyRevenueItem;
import com.garage.oto.dto.admin.RevenueReportResponse;
import com.garage.oto.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

  public List<DailyRevenueItem> dailyRevenue(LocalDate from, LocalDate to) {
    Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
    Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

    // Get actual data from DB
    List<Object[]> rows = paymentRepository.dailyRevenue(PaymentStatus.COMPLETED, start, end);
    Map<LocalDate, DailyRevenueItem> map = new LinkedHashMap<>();
    for (Object[] row : rows) {
      LocalDate day = row[0] instanceof LocalDate ld ? ld : LocalDate.parse(row[0].toString());
      BigDecimal rev = row[1] instanceof BigDecimal bd ? bd : new BigDecimal(row[1].toString());
      long cnt = row[2] instanceof Number n ? n.longValue() : Long.parseLong(row[2].toString());
      map.put(day, new DailyRevenueItem(day, rev, cnt));
    }

    // Fill gaps with zeros so the chart has a continuous axis
    List<DailyRevenueItem> result = new ArrayList<>();
    for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
      result.add(map.getOrDefault(d, new DailyRevenueItem(d, BigDecimal.ZERO, 0)));
    }
    return result;
  }
}

