package com.garage.oto.service;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.BookingStatus;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.domain.RepairProgressEvent;
import com.garage.oto.domain.User;
import com.garage.oto.domain.Vehicle;
import com.garage.oto.dto.repair.RepairIntakeRequest;
import com.garage.oto.dto.repair.RepairOrderResponse;
import com.garage.oto.dto.repair.RepairProgressRequest;
import com.garage.oto.dto.repair.RepairStatusUpdateRequest;
import com.garage.oto.repository.BookingRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.repository.RepairProgressEventRepository;
import com.garage.oto.repository.UserRepository;
import com.garage.oto.repository.VehicleRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepairOrderService {

  private final RepairOrderRepository repairOrderRepository;
  private final RepairProgressEventRepository progressEventRepository;
  private final BookingRepository bookingRepository;
  private final VehicleRepository vehicleRepository;
  private final UserRepository userRepository;
  private final DocumentNumberService documentNumberService;

  public RepairOrderService(
      RepairOrderRepository repairOrderRepository,
      RepairProgressEventRepository progressEventRepository,
      BookingRepository bookingRepository,
      VehicleRepository vehicleRepository,
      UserRepository userRepository,
      DocumentNumberService documentNumberService) {
    this.repairOrderRepository = repairOrderRepository;
    this.progressEventRepository = progressEventRepository;
    this.bookingRepository = bookingRepository;
    this.vehicleRepository = vehicleRepository;
    this.userRepository = userRepository;
    this.documentNumberService = documentNumberService;
  }

  @Transactional(readOnly = true)
  public List<RepairOrderResponse> listForCustomer(User customer) {
    return repairOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
        .map(RepairOrderService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RepairOrderResponse getForCustomer(User customer, Long id) {
    RepairOrder ro = repairOrderRepository.findWithRelationsById(id).orElseThrow(RepairOrderService::notFound);
    if (!ro.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    return toResponse(ro);
  }

  @Transactional(readOnly = true)
  public List<RepairOrderResponse> listForStaff(User staff) {
    return repairOrderRepository.findByAssignedStaffIdOrderByCreatedAtDesc(staff.getId()).stream()
        .map(RepairOrderService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<RepairOrderResponse> listAllActive() {
    return repairOrderRepository
        .findByStatusIn(
            List.of(
                RepairOrderStatus.INTAKE,
                RepairOrderStatus.QUOTING,
                RepairOrderStatus.AWAITING_APPROVAL,
                RepairOrderStatus.IN_PROGRESS,
                RepairOrderStatus.PAUSED))
        .stream()
        .map(RepairOrderService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<RepairOrderResponse> listAllOrders() {
    return repairOrderRepository.findAllByOrderByUpdatedAtDesc().stream()
        .map(RepairOrderService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RepairOrderResponse getById(Long id) {
    RepairOrder ro = repairOrderRepository.findWithRelationsById(id).orElseThrow(RepairOrderService::notFound);
    return toResponse(ro);
  }

  @Transactional
  public RepairOrderResponse intake(User staff, RepairIntakeRequest req) {
    User customer =
        userRepository.findById(req.customerId()).orElseThrow(() -> badRequest("Customer not found"));
    Vehicle vehicle = vehicleRepository.findById(req.vehicleId()).orElseThrow(() -> notFound());
    if (!vehicle.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Vehicle does not belong to customer");
    }
    Booking booking = null;
    if (req.bookingId() != null) {
      booking = bookingRepository.findById(req.bookingId()).orElseThrow(() -> notFound());
      if (!booking.getCustomer().getId().equals(customer.getId())) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Booking mismatch");
      }
      booking.setStatus(BookingStatus.CONFIRMED);
    }
    RepairOrder ro = new RepairOrder();
    ro.setOrderNumber(documentNumberService.nextRepairOrderNumber());
    ro.setBooking(booking);
    ro.setCustomer(customer);
    ro.setVehicle(vehicle);
    if (req.assignedStaffId() != null) {
      ro.setAssignedStaff(
          userRepository.findById(req.assignedStaffId()).orElse(null));
    } else {
      ro.setAssignedStaff(staff);
    }
    ro.setStatus(RepairOrderStatus.INTAKE);
    ro.setIntakeNotes(req.intakeNotes());
    repairOrderRepository.save(ro);
    addProgress(staff, ro, "Tiếp nhận xe", "INTAKE");
    return toResponse(ro);
  }

  @Transactional
  public RepairOrderResponse updateStatus(User staff, Long id, RepairStatusUpdateRequest req) {
    RepairOrder ro = repairOrderRepository.findById(id).orElseThrow(RepairOrderService::notFound);
    ro.setStatus(req.status());
    if (req.progressNotes() != null) {
      ro.setProgressNotes(req.progressNotes());
    }
    addProgress(staff, ro, "Cập nhật trạng thái: " + req.status(), req.status().name());
    return toResponse(ro);
  }

  @Transactional
  public void addProgress(User actor, Long repairOrderId, RepairProgressRequest req) {
    RepairOrder ro =
        repairOrderRepository.findById(repairOrderId).orElseThrow(RepairOrderService::notFound);
    addProgress(actor, ro, req.message(), req.stepLabel());
  }

  private void addProgress(User actor, RepairOrder ro, String message, String stepLabel) {
    RepairProgressEvent e = new RepairProgressEvent();
    e.setRepairOrder(ro);
    e.setMessage(message);
    e.setStepLabel(stepLabel);
    e.setCreatedBy(actor);
    progressEventRepository.save(e);
  }

  @Transactional(readOnly = true)
  public List<com.garage.oto.dto.repair.ProgressEventResponse> listProgressForCustomer(
      User customer, Long repairOrderId) {
    RepairOrder ro =
        repairOrderRepository.findWithRelationsById(repairOrderId).orElseThrow(RepairOrderService::notFound);
    if (!ro.getCustomer().getId().equals(customer.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    return listProgress(repairOrderId);
  }

  @Transactional(readOnly = true)
  public List<com.garage.oto.dto.repair.ProgressEventResponse> listProgress(Long repairOrderId) {
    return progressEventRepository.findByRepairOrderIdOrderByCreatedAtAsc(repairOrderId).stream()
        .map(
            e ->
                new com.garage.oto.dto.repair.ProgressEventResponse(
                    e.getId(),
                    e.getMessage(),
                    e.getStepLabel(),
                    safeUserName(e.getCreatedBy()),
                    e.getCreatedAt()))
        .toList();
  }

  private static String safeUserName(User user) {
    return user != null ? user.getFullName() : null;
  }

  public RepairOrder requireOrder(Long id) {
    return repairOrderRepository.findById(id).orElseThrow(RepairOrderService::notFound);
  }

  @Transactional
  public RepairOrderResponse markWorkCompleted(User staff, Long id) {
    RepairOrder ro = repairOrderRepository.findById(id).orElseThrow(RepairOrderService::notFound);
    ro.setStatus(RepairOrderStatus.COMPLETED);
    addProgress(staff, ro, "Hoàn thành sửa chữa", "COMPLETED");
    return toResponse(ro);
  }

  @Transactional
  public RepairOrderResponse handoverVehicle(User staff, Long id) {
    RepairOrder ro = repairOrderRepository.findById(id).orElseThrow(RepairOrderService::notFound);
    if (ro.getStatus() != RepairOrderStatus.COMPLETED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Order must be completed before handover");
    }
    ro.setStatus(RepairOrderStatus.DELIVERED);
    addProgress(staff, ro, "Bàn giao xe cho khách", "DELIVERED");
    return toResponse(ro);
  }

  private static RepairOrderResponse toResponse(RepairOrder ro) {
    String vehicleLabel =
        (ro.getVehicle().getBrand() != null ? ro.getVehicle().getBrand() + " " : "")
            + (ro.getVehicle().getModel() != null ? ro.getVehicle().getModel() : "");
    return new RepairOrderResponse(
        ro.getId(),
        ro.getOrderNumber(),
        ro.getBooking() != null ? ro.getBooking().getId() : null,
        ro.getCustomer().getId(),
        ro.getCustomer().getFullName(),
        ro.getVehicle().getId(),
        ro.getVehicle().getLicensePlate(),
        vehicleLabel.trim(),
        ro.getAssignedStaff() != null ? ro.getAssignedStaff().getId() : null,
        ro.getAssignedStaff() != null ? ro.getAssignedStaff().getFullName() : null,
        ro.getStatus(),
        ro.getIntakeNotes(),
        ro.getProgressNotes(),
        ro.getCreatedAt(),
        ro.getUpdatedAt());
  }

  private static ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Repair order not found");
  }

  private static ApiException badRequest(String m) {
    return new ApiException(HttpStatus.BAD_REQUEST, m);
  }
}
