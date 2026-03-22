package com.garage.oto.service;

import com.garage.oto.domain.Payment;
import com.garage.oto.domain.PaymentStatus;
import com.garage.oto.domain.Quote;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.User;
import com.garage.oto.dto.payment.PaymentCompleteRequest;
import com.garage.oto.dto.payment.PaymentCreateRequest;
import com.garage.oto.dto.payment.PaymentResponse;
import com.garage.oto.repository.PaymentRepository;
import com.garage.oto.repository.QuoteRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.web.ApiException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

  private final PaymentRepository paymentRepository;
  private final RepairOrderRepository repairOrderRepository;
  private final QuoteRepository quoteRepository;
  private final DocumentNumberService documentNumberService;

  public PaymentService(
      PaymentRepository paymentRepository,
      RepairOrderRepository repairOrderRepository,
      QuoteRepository quoteRepository,
      DocumentNumberService documentNumberService) {
    this.paymentRepository = paymentRepository;
    this.repairOrderRepository = repairOrderRepository;
    this.quoteRepository = quoteRepository;
    this.documentNumberService = documentNumberService;
  }

  public List<PaymentResponse> listForCustomer(User customer) {
    return paymentRepository.findByRepairOrder_Customer_IdOrderByCreatedAtDesc(customer.getId()).stream()
        .map(PaymentService::toResponse)
        .toList();
  }

  @Transactional
  public PaymentResponse create(User customer, PaymentCreateRequest req) {
    RepairOrder ro =
        repairOrderRepository.findById(req.repairOrderId()).orElseThrow(() -> notFoundRo());
    if (!ro.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    Quote q = null;
    if (req.quoteId() != null) {
      q = quoteRepository.findById(req.quoteId()).orElseThrow(() -> notFoundQuote());
      if (!q.getRepairOrder().getId().equals(ro.getId())) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Quote does not match repair order");
      }
    }
    Payment p = new Payment();
    p.setPaymentNumber(documentNumberService.nextPaymentNumber());
    p.setRepairOrder(ro);
    p.setQuote(q);
    p.setAmount(req.amount());
    p.setMethod(req.method());
    p.setStatus(PaymentStatus.PENDING);
    paymentRepository.save(p);
    return toResponse(p);
  }

  @Transactional
  public PaymentResponse complete(User customer, Long paymentId, PaymentCompleteRequest req) {
    Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> notFoundPay());
    if (!p.getRepairOrder().getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    if (p.getStatus() != PaymentStatus.PENDING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Payment already finalized");
    }
    p.setStatus(PaymentStatus.COMPLETED);
    p.setTransactionRef(req.transactionRef());
    p.setPaidAt(Instant.now());
    return toResponse(p);
  }

  private static PaymentResponse toResponse(Payment p) {
    return new PaymentResponse(
        p.getId(),
        p.getPaymentNumber(),
        p.getRepairOrder().getId(),
        p.getQuote() != null ? p.getQuote().getId() : null,
        p.getAmount(),
        p.getMethod(),
        p.getStatus(),
        p.getTransactionRef(),
        p.getPaidAt(),
        p.getCreatedAt());
  }

  private ApiException notFoundRo() {
    return new ApiException(HttpStatus.NOT_FOUND, "Repair order not found");
  }

  private ApiException notFoundQuote() {
    return new ApiException(HttpStatus.NOT_FOUND, "Quote not found");
  }

  private ApiException notFoundPay() {
    return new ApiException(HttpStatus.NOT_FOUND, "Payment not found");
  }
}
