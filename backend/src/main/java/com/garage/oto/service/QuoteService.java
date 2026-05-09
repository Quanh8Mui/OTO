package com.garage.oto.service;

import com.garage.oto.domain.Part;
import com.garage.oto.domain.Quote;
import com.garage.oto.domain.QuoteLine;
import com.garage.oto.domain.QuoteLineType;
import com.garage.oto.domain.QuoteStatus;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.domain.User;
import com.garage.oto.dto.quote.QuoteDecisionRequest;
import com.garage.oto.dto.quote.QuoteLineRequest;
import com.garage.oto.dto.quote.QuoteLineResponse;
import com.garage.oto.dto.quote.QuoteResponse;
import com.garage.oto.dto.quote.QuoteUpsertRequest;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.QuoteRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.web.ApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuoteService {

  private final QuoteRepository quoteRepository;
  private final RepairOrderRepository repairOrderRepository;
  private final ServiceCatalogRepository serviceCatalogRepository;
  private final PartRepository partRepository;
  private final DocumentNumberService documentNumberService;

  public QuoteService(
      QuoteRepository quoteRepository,
      RepairOrderRepository repairOrderRepository,
      ServiceCatalogRepository serviceCatalogRepository,
      PartRepository partRepository,
      DocumentNumberService documentNumberService) {
    this.quoteRepository = quoteRepository;
    this.repairOrderRepository = repairOrderRepository;
    this.serviceCatalogRepository = serviceCatalogRepository;
    this.partRepository = partRepository;
    this.documentNumberService = documentNumberService;
  }

  @Transactional(readOnly = true)
  public List<QuoteResponse> listForCustomer(User customer) {
    return quoteRepository.findByRepairOrder_Customer_IdOrderByCreatedAtDesc(customer.getId()).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<QuoteResponse> listForRepairOrder(Long repairOrderId) {
    return quoteRepository.findByRepairOrderIdOrderByVersionDesc(repairOrderId).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public QuoteResponse get(Long id) {
    Quote q = quoteRepository.findById(id).orElseThrow(() -> notFound());
    return toResponse(q);
  }

  @Transactional(readOnly = true)
  public QuoteResponse getForCustomer(User customer, Long id) {
    Quote q = quoteRepository.findById(id).orElseThrow(() -> notFound());
    if (!q.getRepairOrder().getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    return toResponse(q);
  }

  @Transactional
  public QuoteResponse createDraft(User staff, Long repairOrderId) {
    RepairOrder ro =
        repairOrderRepository.findById(repairOrderId).orElseThrow(() -> notFoundOrder());
    int nextVer =
        quoteRepository.findByRepairOrderIdOrderByVersionDesc(repairOrderId).stream()
            .mapToInt(Quote::getVersion)
            .max()
            .orElse(0)
            + 1;
    Quote q = new Quote();
    q.setQuoteNumber(documentNumberService.nextQuoteNumber());
    q.setRepairOrder(ro);
    q.setVersion(nextVer);
    q.setStatus(QuoteStatus.DRAFT);
    q.setTaxRate(BigDecimal.ZERO);
    quoteRepository.save(q);
    ro.setStatus(RepairOrderStatus.QUOTING);
    return toResponse(q);
  }

  @Transactional
  public QuoteResponse saveLines(User staff, Long quoteId, QuoteUpsertRequest req) {
    Quote q = quoteRepository.findById(quoteId).orElseThrow(() -> notFound());
    if (q.getStatus() != QuoteStatus.DRAFT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Quote is not editable");
    }
    q.getLines().clear();
    for (QuoteLineRequest lr : req.lines()) {
      QuoteLine line = new QuoteLine();
      line.setQuote(q);
      line.setLineType(lr.lineType());
      if (lr.serviceCatalogId() != null) {
        ServiceCatalogItem sci =
            serviceCatalogRepository
                .findById(lr.serviceCatalogId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid service line"));
        line.setServiceCatalog(sci);
      }
      if (lr.partId() != null) {
        Part p = partRepository.findById(lr.partId()).orElseThrow(() -> badRequest("Invalid part"));
        line.setPart(p);
      }
      line.setDescription(lr.description());
      line.setQuantity(lr.quantity());
      line.setUnitPrice(lr.unitPrice());
      line.setLineTotal(
          lr.unitPrice()
              .multiply(lr.quantity())
              .setScale(2, RoundingMode.HALF_UP));
      q.getLines().add(line);
    }
    q.setStaffNotes(req.staffNotes());
    q.setTaxRate(req.taxRate().max(BigDecimal.ZERO));
    recalculateTotals(q);
    quoteRepository.save(q);
    return toResponse(q);
  }

  private void recalculateTotals(Quote q) {
    BigDecimal labor = BigDecimal.ZERO;
    BigDecimal parts = BigDecimal.ZERO;
    for (QuoteLine line : q.getLines()) {
      if (line.getLineType() == QuoteLineType.LABOR) {
        labor = labor.add(line.getLineTotal());
      } else {
        parts = parts.add(line.getLineTotal());
      }
    }
    q.setLaborTotal(labor);
    q.setPartsTotal(parts);
    BigDecimal sub = labor.add(parts);
    BigDecimal taxRatePercent = q.getTaxRate() == null ? BigDecimal.ZERO : q.getTaxRate();
    q.setTaxAmount(
        sub.multiply(taxRatePercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
    q.setGrandTotal(sub.add(q.getTaxAmount()));
  }

  @Transactional
  public QuoteResponse sendToCustomer(User staff, Long quoteId) {
    Quote q = quoteRepository.findById(quoteId).orElseThrow(() -> notFound());
    if (q.getStatus() != QuoteStatus.DRAFT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Quote already sent");
    }
    if (q.getLines().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Quote has no lines");
    }
    q.setStatus(QuoteStatus.SENT);
    q.setSentAt(Instant.now());
    RepairOrder ro = q.getRepairOrder();
    ro.setStatus(RepairOrderStatus.AWAITING_APPROVAL);
    return toResponse(q);
  }

  @Transactional
  public QuoteResponse approve(User customer, Long quoteId, QuoteDecisionRequest req) {
    Quote q = quoteRepository.findById(quoteId).orElseThrow(() -> notFound());
    if (!q.getRepairOrder().getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    if (q.getStatus() != QuoteStatus.SENT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Quote is not awaiting approval");
    }
    q.setStatus(QuoteStatus.APPROVED);
    q.setApprovedAt(Instant.now());
    q.setCustomerResponseNote(req.note());
    RepairOrder ro = q.getRepairOrder();
    ro.setStatus(RepairOrderStatus.IN_PROGRESS);
    return toResponse(q);
  }

  @Transactional
  public QuoteResponse reject(User customer, Long quoteId, QuoteDecisionRequest req) {
    Quote q = quoteRepository.findById(quoteId).orElseThrow(() -> notFound());
    if (!q.getRepairOrder().getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    if (q.getStatus() != QuoteStatus.SENT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Quote is not awaiting approval");
    }
    q.setStatus(QuoteStatus.REJECTED);
    q.setRejectedAt(Instant.now());
    q.setRejectedReason(req.rejectedReason());
    q.setCustomerResponseNote(req.note());
    q.getRepairOrder().setStatus(RepairOrderStatus.QUOTING);
    return toResponse(q);
  }

  private QuoteResponse toResponse(Quote q) {
    List<QuoteLineResponse> lines =
        q.getLines().stream()
            .map(
                l ->
                    new QuoteLineResponse(
                        l.getId(),
                        l.getLineType(),
                        l.getServiceCatalog() != null ? l.getServiceCatalog().getId() : null,
                        l.getPart() != null ? l.getPart().getId() : null,
                        l.getDescription(),
                        l.getQuantity(),
                        l.getUnitPrice(),
                        l.getLineTotal()))
            .toList();
    return new QuoteResponse(
        q.getId(),
        q.getQuoteNumber(),
        q.getRepairOrder().getId(),
        q.getVersion(),
        q.getStatus(),
        q.getLaborTotal(),
        q.getPartsTotal(),
        q.getTaxRate(),
        q.getTaxAmount(),
        q.getGrandTotal(),
        q.getStaffNotes(),
        q.getCustomerResponseNote(),
        q.getCreatedAt(),
        q.getSentAt(),
        q.getApprovedAt(),
        q.getRejectedAt(),
        q.getRejectedReason(),
        lines);
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Quote not found");
  }

  private ApiException notFoundOrder() {
    return new ApiException(HttpStatus.NOT_FOUND, "Repair order not found");
  }

  private ApiException badRequest(String m) {
    return new ApiException(HttpStatus.BAD_REQUEST, m);
  }
}
