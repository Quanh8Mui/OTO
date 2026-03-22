package com.garage.oto.service;

import com.garage.oto.repository.BookingRepository;
import com.garage.oto.repository.PartsRequestRepository;
import com.garage.oto.repository.PaymentRepository;
import com.garage.oto.repository.QuoteRepository;
import com.garage.oto.repository.RepairOrderRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class DocumentNumberService {

  private static final DateTimeFormatter DAY = DateTimeFormatter.BASIC_ISO_DATE;

  private final BookingRepository bookingRepository;
  private final RepairOrderRepository repairOrderRepository;
  private final QuoteRepository quoteRepository;
  private final PartsRequestRepository partsRequestRepository;
  private final PaymentRepository paymentRepository;

  public DocumentNumberService(
      BookingRepository bookingRepository,
      RepairOrderRepository repairOrderRepository,
      QuoteRepository quoteRepository,
      PartsRequestRepository partsRequestRepository,
      PaymentRepository paymentRepository) {
    this.bookingRepository = bookingRepository;
    this.repairOrderRepository = repairOrderRepository;
    this.quoteRepository = quoteRepository;
    this.partsRequestRepository = partsRequestRepository;
    this.paymentRepository = paymentRepository;
  }

  public String nextBookingNumber() {
    String day = LocalDate.now().format(DAY);
    long n = bookingRepository.count() + 1;
    return "BK-" + day + "-" + String.format("%04d", n);
  }

  public String nextRepairOrderNumber() {
    String day = LocalDate.now().format(DAY);
    long n = repairOrderRepository.count() + 1;
    return "RO-" + day + "-" + String.format("%04d", n);
  }

  public String nextQuoteNumber() {
    String day = LocalDate.now().format(DAY);
    long n = quoteRepository.count() + 1;
    return "QT-" + day + "-" + String.format("%04d", n);
  }

  public String nextPartsRequestNumber() {
    String day = LocalDate.now().format(DAY);
    long n = partsRequestRepository.count() + 1;
    return "PR-" + day + "-" + String.format("%04d", n);
  }

  public String nextPaymentNumber() {
    String day = LocalDate.now().format(DAY);
    long n = paymentRepository.count() + 1;
    return "PAY-" + day + "-" + String.format("%04d", n);
  }
}
