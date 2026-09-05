package com.garage.oto.service;

import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.domain.ServiceRating;
import com.garage.oto.domain.User;
import com.garage.oto.dto.rating.ServiceRatingRequest;
import com.garage.oto.dto.rating.ServiceRatingResponse;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.repository.ServiceRatingRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServiceRatingService {

  private final ServiceRatingRepository serviceRatingRepository;
  private final RepairOrderRepository repairOrderRepository;

  public ServiceRatingService(
      ServiceRatingRepository serviceRatingRepository,
      RepairOrderRepository repairOrderRepository) {
    this.serviceRatingRepository = serviceRatingRepository;
    this.repairOrderRepository = repairOrderRepository;
  }

  public List<ServiceRatingResponse> listForCustomer(User customer) {
    return serviceRatingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
        .map(ServiceRatingService::toResponse)
        .toList();
  }

  @Transactional
  public ServiceRatingResponse create(User customer, ServiceRatingRequest req) {
    RepairOrder ro =
        repairOrderRepository.findWithRelationsById(req.repairOrderId()).orElseThrow(() -> notFoundRo());
    if (!ro.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    if (ro.getStatus() != RepairOrderStatus.DELIVERED && ro.getStatus() != RepairOrderStatus.COMPLETED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Order must be completed or delivered to rate");
    }
    if (serviceRatingRepository.findByRepairOrderId(ro.getId()).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Already rated");
    }
    ServiceRating r = new ServiceRating();
    r.setRepairOrder(ro);
    r.setCustomer(customer);
    r.setRating(req.rating());
    r.setComment(req.comment());
    serviceRatingRepository.save(r);
    return toResponse(r);
  }

  public List<ServiceRatingResponse> listAll() {
    return serviceRatingRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(ServiceRatingService::toResponse)
        .toList();
  }

  private static ServiceRatingResponse toResponse(ServiceRating r) {
    String orderNumber = r.getRepairOrder() != null ? r.getRepairOrder().getOrderNumber() : null;
    String licensePlate = (r.getRepairOrder() != null && r.getRepairOrder().getVehicle() != null)
        ? r.getRepairOrder().getVehicle().getLicensePlate() : null;
    String customerName = r.getCustomer() != null ? r.getCustomer().getFullName() : null;
    return new ServiceRatingResponse(
        r.getId(),
        r.getRepairOrder() != null ? r.getRepairOrder().getId() : null,
        orderNumber,
        licensePlate,
        customerName,
        r.getRating(),
        r.getComment(),
        r.getCreatedAt());
  }

  private ApiException notFoundRo() {
    return new ApiException(HttpStatus.NOT_FOUND, "Repair order not found");
  }
}
