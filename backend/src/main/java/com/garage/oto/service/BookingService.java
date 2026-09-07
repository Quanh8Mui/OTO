package com.garage.oto.service;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.BookingStatus;
import com.garage.oto.domain.Quote;
import com.garage.oto.domain.QuoteStatus;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.domain.User;
import com.garage.oto.domain.Vehicle;
import com.garage.oto.dto.booking.BookingRequest;
import com.garage.oto.dto.booking.BookingResponse;
import com.garage.oto.repository.BookingRepository;
import com.garage.oto.repository.QuoteRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.web.ApiException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

  private final BookingRepository bookingRepository;
  private final ServiceCatalogRepository serviceCatalogRepository;
  private final VehicleService vehicleService;
  private final DocumentNumberService documentNumberService;
  private final RepairOrderRepository repairOrderRepository;
  private final QuoteRepository quoteRepository;
  private final EmailService emailService;

  public BookingService(
      BookingRepository bookingRepository,
      ServiceCatalogRepository serviceCatalogRepository,
      VehicleService vehicleService,
      DocumentNumberService documentNumberService,
      RepairOrderRepository repairOrderRepository,
      QuoteRepository quoteRepository,
      EmailService emailService) {
    this.bookingRepository = bookingRepository;
    this.serviceCatalogRepository = serviceCatalogRepository;
    this.vehicleService = vehicleService;
    this.documentNumberService = documentNumberService;
    this.repairOrderRepository = repairOrderRepository;
    this.quoteRepository = quoteRepository;
    this.emailService = emailService;
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> list(User customer) {
    return enrichBookings(
        bookingRepository.findByCustomerIdOrderByRequestedDateDescCreatedAtDesc(customer.getId()));
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> listPending() {
    return enrichBookings(
        bookingRepository.findAllByStatusOrderByCreatedAtDesc(BookingStatus.PENDING));
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> listAll() {
    return enrichBookings(bookingRepository.findAllWithRelations());
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> listForStaff(User staff) {
    List<BookingResponse> all = enrichBookings(bookingRepository.findAllWithRelations());
    return all.stream()
        .filter(b -> {
          // If a booking has an assigned staff member, only that staff member can see it in their schedule
          if (b.assignedStaffId() != null) {
            return b.assignedStaffId().equals(staff.getId());
          }
          // Unassigned bookings (e.g. PENDING intake) remain visible so any staff can intake them
          return true;
        })
        .toList();
  }

  @Transactional
  public BookingResponse create(User customer, BookingRequest req) {
    Vehicle v = resolveVehicle(customer, req);

    // Prevent duplicate bookings for same vehicle on same date
    boolean hasActiveBooking =
        bookingRepository.existsActiveBookingForVehicleOnDate(v.getId(), req.requestedDate());
    if (hasActiveBooking) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "Xe "
              + v.getLicensePlate()
              + " đã có lịch hẹn hoặc đang được xử lý vào ngày "
              + req.requestedDate()
              + ". Vui lòng không đặt lịch trùng lặp.");
    }

    ServiceCatalogItem catalog = null;
    if (req.serviceCatalogId() != null) {
      catalog =
          serviceCatalogRepository
              .findById(req.serviceCatalogId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown service"));
    }
    Booking b = new Booking();
    b.setBookingNumber(documentNumberService.nextBookingNumber());
    b.setCustomer(customer);
    b.setVehicle(v);
    b.setServiceCatalog(catalog);
    b.setServiceTypeLabel(req.serviceTypeLabel());
    b.setRequestedDate(req.requestedDate());
    b.setTimeSlot(req.timeSlot());
    b.setNotes(req.notes());
    b.setStatus(BookingStatus.PENDING);
    bookingRepository.save(b);

    String customerEmail = customer != null ? customer.getEmail() : null;
    String customerName = customer != null ? customer.getFullName() : "Quý khách";
    String licensePlate = v != null ? v.getLicensePlate() : "";
    String vehicleModel = v != null ? ((v.getBrand() != null ? v.getBrand() : "") + " " + (v.getModel() != null ? v.getModel() : "")).trim() : "";
    String serviceName = catalog != null ? catalog.getName() : (b.getServiceTypeLabel() != null ? b.getServiceTypeLabel() : "Bảo dưỡng chung");
    String dateStr = b.getRequestedDate() != null ? b.getRequestedDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
    String timeSlot = b.getTimeSlot() != null ? b.getTimeSlot() : "";

    emailService.sendBookingConfirmedEmail(customerEmail, customerName, licensePlate, vehicleModel, serviceName, b.getBookingNumber(), dateStr, timeSlot);
    return toResponse(b, null, null);
  }

  private Vehicle resolveVehicle(User customer, BookingRequest req) {
    if (req.vehicleId() != null) {
      return vehicleService.getOwnedVehicle(customer, req.vehicleId());
    }
    if (req.licensePlate() == null || req.licensePlate().trim().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "License plate is required");
    }
    String licensePlate = req.licensePlate().trim().toUpperCase();
    return vehicleService.findByCustomerAndLicensePlate(customer, licensePlate)
        .orElseGet(() -> vehicleService.createForBooking(customer, req));
  }

  private List<BookingResponse> enrichBookings(List<Booking> bookings) {
    if (bookings == null || bookings.isEmpty()) {
      return List.of();
    }
    List<Long> bookingIds = bookings.stream().map(Booking::getId).toList();
    List<RepairOrder> repairOrders = repairOrderRepository.findByBooking_IdIn(bookingIds);
    Map<Long, RepairOrder> roByBookingId = repairOrders.stream()
        .filter(ro -> ro.getBooking() != null)
        .collect(Collectors.toMap(ro -> ro.getBooking().getId(), ro -> ro, (a, b) -> a));

    List<Long> roIds = repairOrders.stream().map(RepairOrder::getId).toList();
    Map<Long, Quote> latestQuoteByRoId = new HashMap<>();
    if (!roIds.isEmpty()) {
      List<Quote> quotes = quoteRepository.findByRepairOrder_IdInOrderByVersionDesc(roIds);
      for (Quote q : quotes) {
        if (q.getRepairOrder() != null) {
          latestQuoteByRoId.putIfAbsent(q.getRepairOrder().getId(), q);
        }
      }
    }

    return bookings.stream()
        .map(b -> {
          RepairOrder ro = roByBookingId.get(b.getId());
          Quote q = ro != null ? latestQuoteByRoId.get(ro.getId()) : null;
          return toResponse(b, ro, q);
        })
        .toList();
  }

  private static BookingResponse toResponse(Booking b, RepairOrder ro, Quote q) {
    String vehicleLabel = null;
    if (b.getVehicle() != null) {
      String brand = b.getVehicle().getBrand() != null ? b.getVehicle().getBrand().trim() : "";
      String model = b.getVehicle().getModel() != null ? b.getVehicle().getModel().trim() : "";
      String label = (brand + " " + model).trim();
      vehicleLabel = label.isEmpty() ? null : label;
    }

    String customerPhone = b.getCustomer() != null ? b.getCustomer().getPhone() : null;
    String customerName = b.getCustomer() != null ? b.getCustomer().getFullName() : null;

    Long roId = ro != null ? ro.getId() : null;
    String roNumber = ro != null ? ro.getOrderNumber() : null;
    RepairOrderStatus roStatus = ro != null ? ro.getStatus() : null;

    Long assignedStaffId = null;
    String assignedStaffName = null;
    if (ro != null && ro.getAssignedStaff() != null) {
      assignedStaffId = ro.getAssignedStaff().getId();
      assignedStaffName = ro.getAssignedStaff().getFullName();
    }

    QuoteStatus qStatus = q != null ? q.getStatus() : null;
    String qRejectedReason = q != null ? q.getRejectedReason() : null;

    return new BookingResponse(
        b.getId(),
        b.getCustomer() != null ? b.getCustomer().getId() : null,
        customerName,
        customerPhone,
        b.getBookingNumber(),
        b.getVehicle() != null ? b.getVehicle().getId() : null,
        b.getVehicle() != null ? b.getVehicle().getLicensePlate() : null,
        vehicleLabel,
        b.getServiceCatalog() != null ? b.getServiceCatalog().getId() : null,
        b.getServiceCatalog() != null ? b.getServiceCatalog().getName() : null,
        b.getServiceTypeLabel(),
        b.getRequestedDate(),
        b.getTimeSlot(),
        b.getNotes(),
        b.getStatus(),
        roId,
        roNumber,
        roStatus,
        assignedStaffId,
        assignedStaffName,
        qStatus,
        qRejectedReason,
        b.getCreatedAt());
  }
}
