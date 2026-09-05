package com.garage.oto.service;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.BookingStatus;
import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.domain.User;
import com.garage.oto.domain.Vehicle;
import com.garage.oto.dto.booking.BookingRequest;
import com.garage.oto.dto.booking.BookingResponse;
import com.garage.oto.repository.BookingRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

  private final BookingRepository bookingRepository;
  private final ServiceCatalogRepository serviceCatalogRepository;
  private final VehicleService vehicleService;
  private final DocumentNumberService documentNumberService;

  public BookingService(
      BookingRepository bookingRepository,
      ServiceCatalogRepository serviceCatalogRepository,
      VehicleService vehicleService,
      DocumentNumberService documentNumberService) {
    this.bookingRepository = bookingRepository;
    this.serviceCatalogRepository = serviceCatalogRepository;
    this.vehicleService = vehicleService;
    this.documentNumberService = documentNumberService;
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> list(User customer) {
    return bookingRepository.findByCustomerIdOrderByRequestedDateDescCreatedAtDesc(customer.getId())
        .stream()
        .map(BookingService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> listPending() {
    return bookingRepository.findAllByStatusOrderByCreatedAtDesc(BookingStatus.PENDING).stream()
        .map(BookingService::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> listAll() {
    return bookingRepository.findAll().stream()
        .sorted((a, b) -> b.getRequestedDate().compareTo(a.getRequestedDate()))
        .map(BookingService::toResponse)
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
    return toResponse(b);
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

  private static BookingResponse toResponse(Booking b) {
    return new BookingResponse(
        b.getId(),
        b.getCustomer().getId(),
        b.getCustomer().getFullName(),
        b.getBookingNumber(),
        b.getVehicle().getId(),
        b.getVehicle().getLicensePlate(),
        b.getServiceCatalog() != null ? b.getServiceCatalog().getId() : null,
        b.getServiceCatalog() != null ? b.getServiceCatalog().getName() : null,
        b.getServiceTypeLabel(),
        b.getRequestedDate(),
        b.getTimeSlot(),
        b.getNotes(),
        b.getStatus(),
        b.getCreatedAt());
  }
}
