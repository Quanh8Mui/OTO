package com.garage.oto.service;

import com.garage.oto.domain.Part;
import com.garage.oto.domain.PartsRequest;
import com.garage.oto.domain.PartsRequestLine;
import com.garage.oto.domain.PartsRequestStatus;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.User;
import com.garage.oto.dto.parts.PartsRequestCreateRequest;
import com.garage.oto.dto.parts.PartsRequestLineDto;
import com.garage.oto.dto.parts.PartsRequestLineResponse;
import com.garage.oto.dto.parts.PartsRequestResponse;
import com.garage.oto.dto.parts.PartsRequestReviewRequest;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.PartsRequestRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.web.ApiException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartsRequestService {

  private final PartsRequestRepository partsRequestRepository;
  private final RepairOrderRepository repairOrderRepository;
  private final PartRepository partRepository;
  private final DocumentNumberService documentNumberService;

  public PartsRequestService(
      PartsRequestRepository partsRequestRepository,
      RepairOrderRepository repairOrderRepository,
      PartRepository partRepository,
      DocumentNumberService documentNumberService) {
    this.partsRequestRepository = partsRequestRepository;
    this.repairOrderRepository = repairOrderRepository;
    this.partRepository = partRepository;
    this.documentNumberService = documentNumberService;
  }

  public List<PartsRequestResponse> listForRepairOrder(Long repairOrderId) {
    return partsRequestRepository.findByRepairOrderIdOrderByCreatedAtDesc(repairOrderId).stream()
        .map(this::toResponse)
        .toList();
  }

  public List<PartsRequestResponse> listPending() {
    return partsRequestRepository.findAll().stream()
        .filter(p -> p.getStatus() == PartsRequestStatus.PENDING)
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public PartsRequestResponse create(User staff, PartsRequestCreateRequest req) {
    RepairOrder ro =
        repairOrderRepository.findById(req.repairOrderId()).orElseThrow(() -> notFoundRo());
    PartsRequest pr = new PartsRequest();
    pr.setRequestNumber(documentNumberService.nextPartsRequestNumber());
    pr.setRepairOrder(ro);
    pr.setRequestedByStaff(staff);
    pr.setStatus(PartsRequestStatus.PENDING);
    for (PartsRequestLineDto line : req.lines()) {
      Part p = partRepository.findById(line.partId()).orElseThrow(() -> badRequest("Invalid part"));
      PartsRequestLine pl = new PartsRequestLine();
      pl.setPartsRequest(pr);
      pl.setPart(p);
      pl.setQuantityRequested(line.quantityRequested());
      pl.setQuantityIssued(0);
      pr.getLines().add(pl);
    }
    partsRequestRepository.save(pr);
    return toResponse(pr);
  }

  @Transactional
  public PartsRequestResponse approve(Long id, PartsRequestReviewRequest req) {
    PartsRequest pr = partsRequestRepository.findById(id).orElseThrow(() -> notFound());
    if (pr.getStatus() != PartsRequestStatus.PENDING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Request is not pending");
    }
    pr.setStatus(PartsRequestStatus.APPROVED);
    pr.setAdminNote(req.adminNote());
    return toResponse(pr);
  }

  @Transactional
  public PartsRequestResponse fulfill(Long id, PartsRequestReviewRequest req) {
    PartsRequest pr = partsRequestRepository.findById(id).orElseThrow(() -> notFound());
    if (pr.getStatus() != PartsRequestStatus.APPROVED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Request must be approved first");
    }
    for (PartsRequestLine line : pr.getLines()) {
      Part p = line.getPart();
      if (p.getQuantityOnHand() < line.getQuantityRequested()) {
        throw new ApiException(
            HttpStatus.BAD_REQUEST, "Insufficient stock for part: " + p.getSku());
      }
      p.setQuantityOnHand(p.getQuantityOnHand() - line.getQuantityRequested());
      line.setQuantityIssued(line.getQuantityRequested());
    }
    pr.setStatus(PartsRequestStatus.FULFILLED);
    pr.setFulfilledAt(Instant.now());
    if (req != null && req.adminNote() != null) {
      pr.setAdminNote(req.adminNote());
    }
    return toResponse(pr);
  }

  @Transactional
  public PartsRequestResponse reject(Long id, PartsRequestReviewRequest req) {
    PartsRequest pr = partsRequestRepository.findById(id).orElseThrow(() -> notFound());
    if (pr.getStatus() != PartsRequestStatus.PENDING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Request is not pending");
    }
    pr.setStatus(PartsRequestStatus.REJECTED);
    pr.setAdminNote(req != null ? req.adminNote() : null);
    return toResponse(pr);
  }

  private PartsRequestResponse toResponse(PartsRequest pr) {
    List<PartsRequestLineResponse> lines =
        pr.getLines().stream()
            .map(
                l ->
                    new PartsRequestLineResponse(
                        l.getId(),
                        l.getPart().getId(),
                        l.getPart().getName(),
                        l.getPart().getSku(),
                        l.getQuantityRequested(),
                        l.getQuantityIssued()))
            .toList();
    return new PartsRequestResponse(
        pr.getId(),
        pr.getRequestNumber(),
        pr.getRepairOrder().getId(),
        pr.getRequestedByStaff().getId(),
        pr.getStatus(),
        pr.getAdminNote(),
        pr.getCreatedAt(),
        pr.getFulfilledAt(),
        lines);
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Parts request not found");
  }

  private ApiException notFoundRo() {
    return new ApiException(HttpStatus.NOT_FOUND, "Repair order not found");
  }

  private ApiException badRequest(String m) {
    return new ApiException(HttpStatus.BAD_REQUEST, m);
  }
}
