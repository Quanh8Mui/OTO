package com.garage.oto.config;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.BookingStatus;
import com.garage.oto.domain.Employee;
import com.garage.oto.domain.NotificationSetting;
import com.garage.oto.domain.Part;
import com.garage.oto.domain.Payment;
import com.garage.oto.domain.PaymentMethod;
import com.garage.oto.domain.PaymentStatus;
import com.garage.oto.domain.PartsRequest;
import com.garage.oto.domain.PartsRequestLine;
import com.garage.oto.domain.PartsRequestStatus;
import com.garage.oto.domain.Quote;
import com.garage.oto.domain.QuoteLine;
import com.garage.oto.domain.QuoteLineType;
import com.garage.oto.domain.QuoteStatus;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairOrderStatus;
import com.garage.oto.domain.RepairProgressEvent;
import com.garage.oto.domain.Role;
import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.domain.ServiceRating;
import com.garage.oto.domain.StaffSchedule;
import com.garage.oto.domain.User;
import com.garage.oto.domain.Vehicle;
import com.garage.oto.repository.BookingRepository;
import com.garage.oto.repository.EmployeeRepository;
import com.garage.oto.repository.NotificationSettingRepository;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.PartsRequestRepository;
import com.garage.oto.repository.PaymentRepository;
import com.garage.oto.repository.QuoteRepository;
import com.garage.oto.repository.RepairOrderRepository;
import com.garage.oto.repository.RepairProgressEventRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.repository.ServiceRatingRepository;
import com.garage.oto.repository.StaffScheduleRepository;
import com.garage.oto.repository.UserRepository;
import com.garage.oto.repository.VehicleRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Profile({"dev", "test"})
@Component
@RequiredArgsConstructor
@Transactional
public class DataInitializer implements ApplicationRunner {

  private final UserRepository userRepository;
  private final EmployeeRepository employeeRepository;
  private final VehicleRepository vehicleRepository;
  private final BookingRepository bookingRepository;
  private final RepairOrderRepository repairOrderRepository;
  private final QuoteRepository quoteRepository;
  private final PaymentRepository paymentRepository;
  private final PartsRequestRepository partsRequestRepository;
  private final StaffScheduleRepository staffScheduleRepository;
  private final RepairProgressEventRepository repairProgressEventRepository;
  private final PasswordEncoder passwordEncoder;
  private final ServiceCatalogRepository serviceCatalogRepository;
  private final PartRepository partRepository;
  private final NotificationSettingRepository notificationSettingRepository;
  private final ServiceRatingRepository serviceRatingRepository;

  @Override
  public void run(ApplicationArguments args) {
    User admin = ensureUser("admin@garage.local", "Admin@123", "Administrator", Role.ADMIN, "0909000001");
    User staff = ensureUser("staff@garage.local", "Staff@123", "Trần Minh Khoa", Role.STAFF, "0909000002");
    User customer1 = ensureUser("customer1@garage.local", "Customer@123", "Nguyễn Văn An", Role.CUSTOMER, "0909000003");
    User customer2 = ensureUser("customer2@garage.local", "Customer@123", "Lê Thị Mai", Role.CUSTOMER, "0909000004");

    ensureEmployee(staff, "EMP-001", "Kỹ thuật viên trưởng");

    ServiceCatalogItem bd50k = ensureService("BD-50K", "Bảo dưỡng 50.000 km", "Lọc dầu, lọc gió, kiểm tra tổng quát", new BigDecimal("2500000"));
    ServiceCatalogItem bd40k = ensureService("BD-40K", "Bảo dưỡng 40.000 km", "Định kỳ theo hãng", new BigDecimal("2100000"));
    ServiceCatalogItem chk = ensureService("CHK-GEN", "Kiểm tra tổng quát", "Đọc lỗi, kiểm tra cơ bản", new BigDecimal("350000"));

    Part oil = ensurePart("OIL-5W30", "Dầu động cơ 5W-30", new BigDecimal("180000"), 40, 5);
    Part filter = ensurePart("FIL-AIR", "Lọc gió động cơ", new BigDecimal("120000"), 25, 5);
    Part brake = ensurePart("BRK-PAD-F", "Má phanh trước", new BigDecimal("890000"), 12, 2);

    ensureNotif("BOOKING_CONFIRMED", "Đặt lịch thành công");
    ensureNotif("QUOTE_READY", "Báo giá đã sẵn sàng");
    ensureNotif("REPAIR_STATUS", "Cập nhật tiến độ sửa chữa");

    Vehicle v1 = ensureVehicle(customer1, "51A-12345", "Toyota", "Vios", 2021, "VIN-OTO-0001", "Đỏ");
    Vehicle v2 = ensureVehicle(customer2, "59B-88888", "Honda", "CR-V", 2022, "VIN-OTO-0002", "Đen");

    Booking b1 = ensureBooking("BK-20260501-001", customer1, v1, bd50k, LocalDate.now().plusDays(1), "08:00 - 10:00", "Bảo dưỡng định kỳ", BookingStatus.CONFIRMED);
    Booking b2 = ensureBooking("BK-20260501-002", customer2, v2, bd40k, LocalDate.now().plusDays(2), "13:00 - 15:00", "Kiểm tra tiếng kêu gầm", BookingStatus.PENDING);

    RepairOrder ro1 = ensureRepairOrder("RO-20260501-001", b1, customer1, v1, staff, RepairOrderStatus.IN_PROGRESS, "Tiếp nhận và kiểm tra ban đầu", "Đang thay dầu và lọc gió");
    RepairOrder ro2 = ensureRepairOrder("RO-20260501-002", b2, customer2, v2, staff, RepairOrderStatus.AWAITING_APPROVAL, "Khách cần duyệt báo giá", "Chờ khách xác nhận báo giá");

    ensureProgressEvent(ro1, "CHECKIN", "Tiếp nhận xe", "Xe đã vào xưởng, kiểm tra tổng quát");
    ensureProgressEvent(ro1, "MAINTENANCE", "Đang bảo dưỡng", "Đang thay dầu, thay lọc gió");
    ensureProgressEvent(ro2, "INSPECTION", "Đang kiểm tra", "Đánh giá tình trạng phanh và gầm");

    Quote q1 = ensureQuote("QT-20260501-001", ro1, 1, QuoteStatus.APPROVED, new BigDecimal("650000"), new BigDecimal("180000"), new BigDecimal("830000"), "Đã duyệt bởi khách hàng", "OK");
    ensureQuoteLine(q1, 1, QuoteLineType.LABOR, "Công thay dầu", new BigDecimal("300000"), 1);
    ensureQuoteLine(q1, 2, QuoteLineType.PART, "Dầu động cơ 5W-30", new BigDecimal("180000"), 1);
    ensureQuoteLine(q1, 3, QuoteLineType.PART, "Lọc gió động cơ", new BigDecimal("120000"), 1);
    ensureQuoteLine(q1, 4, QuoteLineType.LABOR, "Kiểm tra tổng quát", new BigDecimal("150000"), 1);

    Payment p1 = ensurePayment("PAY-20260501-001", ro1, q1, new BigDecimal("830000"), PaymentMethod.CASH, PaymentStatus.COMPLETED, "TXN-OTO-0001");

    ensurePartsRequest("PR-20260501-001", ro1, staff, PartsRequestStatus.APPROVED, "Phụ tùng đã cấp", List.of(
        new PartsRequestLineData(oil, 1),
        new PartsRequestLineData(filter, 1)));
    ensurePartsRequest("PR-20260501-002", ro2, staff, PartsRequestStatus.PENDING, "Chờ duyệt thêm phụ tùng", List.of(
        new PartsRequestLineData(brake, 2)));

    ensureSchedule(staff, DayOfWeek.MONDAY.getValue(), LocalTime.of(8, 0), LocalTime.of(17, 0));
    ensureSchedule(staff, DayOfWeek.TUESDAY.getValue(), LocalTime.of(8, 0), LocalTime.of(17, 0));

    ensureRating(ro1, customer1, 5, "Dịch vụ nhanh, báo giá rõ ràng, nhân viên thân thiện.");
    ensureRating(ro2, customer2, 4, "Tư vấn tốt, cần cập nhật tiến độ thường xuyên hơn.");
  }

  private User ensureUser(String email, String rawPassword, String fullName, Role role, String phone) {
    return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
      User user = new User();
      user.setEmail(email);
      user.setPasswordHash(passwordEncoder.encode(rawPassword));
      user.setFullName(fullName);
      user.setPhone(phone);
      user.setRole(role);
      user.setActive(true);
      return userRepository.save(user);
    });
  }

  private void ensureEmployee(User staff, String code, String position) {
    if (employeeRepository.existsByEmployeeCode(code)) {
      return;
    }
    Employee employee = new Employee();
    employee.setUser(staff);
    employee.setEmployeeCode(code);
    employee.setPosition(position);
    employeeRepository.save(employee);
  }

  private ServiceCatalogItem ensureService(String code, String name, String desc, BigDecimal price) {
    return serviceCatalogRepository.findByActiveTrueOrderByNameAsc().stream()
        .filter(item -> code.equalsIgnoreCase(item.getCode()))
        .findFirst()
        .orElseGet(() -> {
          ServiceCatalogItem s = new ServiceCatalogItem();
          s.setCode(code);
          s.setName(name);
          s.setDescription(desc);
          s.setBasePrice(price);
          s.setActive(true);
          return serviceCatalogRepository.save(s);
        });
  }

  private Part ensurePart(String sku, String name, BigDecimal price, int qty, int min) {
    return partRepository.findByActiveTrueOrderByNameAsc().stream()
        .filter(item -> sku.equalsIgnoreCase(item.getSku()))
        .findFirst()
        .orElseGet(() -> {
          Part p = new Part();
          p.setSku(sku);
          p.setName(name);
          p.setUnitPrice(price);
          p.setQuantityOnHand(qty);
          p.setMinStock(min);
          p.setCategory("GENERAL");
          p.setActive(true);
          return partRepository.save(p);
        });
  }

  private void ensureNotif(String key, String title) {
    if (notificationSettingRepository.findByEventKey(key).isPresent()) {
      return;
    }
    NotificationSetting n = new NotificationSetting();
    n.setEventKey(key);
    n.setEnabled(true);
    n.setChannel("EMAIL");
    n.setTemplateSubject(title);
    n.setTemplateBody("Xin chào {{customerName}}, bạn có thông báo từ garage.");
    notificationSettingRepository.save(n);
  }

  private Vehicle ensureVehicle(User customer, String plate, String brand, String model, int year, String vin, String color) {
    return vehicleRepository.findAll().stream()
        .filter(v -> plate.equalsIgnoreCase(v.getLicensePlate()))
        .findFirst()
        .orElseGet(() -> {
          Vehicle v = new Vehicle();
          v.setCustomer(customer);
          v.setLicensePlate(plate);
          v.setBrand(brand);
          v.setModel(model);
          v.setYear(year);
          v.setVin(vin);
          v.setColor(color);
          return vehicleRepository.save(v);
        });
  }

  private Booking ensureBooking(String number, User customer, Vehicle vehicle, ServiceCatalogItem service, LocalDate requestedDate, String slot, String notes, BookingStatus status) {
    return bookingRepository.findAll().stream()
        .filter(b -> number.equals(b.getBookingNumber()))
        .findFirst()
        .orElseGet(() -> {
          Booking booking = new Booking();
          booking.setBookingNumber(number);
          booking.setCustomer(customer);
          booking.setVehicle(vehicle);
          booking.setServiceCatalog(service);
          booking.setServiceTypeLabel(service.getName());
          booking.setRequestedDate(requestedDate);
          booking.setTimeSlot(slot);
          booking.setNotes(notes);
          booking.setStatus(status);
          return bookingRepository.save(booking);
        });
  }

  private RepairOrder ensureRepairOrder(String number, Booking booking, User customer, Vehicle vehicle, User staff, RepairOrderStatus status, String intakeNotes, String progressNotes) {
    return repairOrderRepository.findByOrderNumber(number).orElseGet(() -> {
      RepairOrder ro = new RepairOrder();
      ro.setOrderNumber(number);
      ro.setBooking(booking);
      ro.setCustomer(customer);
      ro.setVehicle(vehicle);
      ro.setAssignedStaff(staff);
      ro.setStatus(status);
      ro.setIntakeNotes(intakeNotes);
      ro.setProgressNotes(progressNotes);
      return repairOrderRepository.save(ro);
    });
  }

  private void ensureProgressEvent(RepairOrder order, String stage, String title, String note) {
    boolean exists = repairProgressEventRepository.findByRepairOrderIdOrderByCreatedAtAsc(order.getId()).stream()
        .anyMatch(e -> note.equalsIgnoreCase(e.getMessage()));
    if (exists) {
      return;
    }
    RepairProgressEvent event = new RepairProgressEvent();
    event.setRepairOrder(order);
    event.setMessage(note);
    event.setStepLabel(title);
    event.setCreatedBy(order.getAssignedStaff());
    repairProgressEventRepository.save(event);
  }

  private Quote ensureQuote(String number, RepairOrder order, int version, QuoteStatus status, BigDecimal labor, BigDecimal parts, BigDecimal total, String staffNotes, String customerNote) {
    return quoteRepository.findByQuoteNumber(number).orElseGet(() -> {
      Quote quote = new Quote();
      quote.setQuoteNumber(number);
      quote.setRepairOrder(order);
      quote.setVersion(version);
      quote.setStatus(status);
      quote.setLaborTotal(labor);
      quote.setPartsTotal(parts);
      quote.setTaxRate(new BigDecimal("0.0000"));
      quote.setTaxAmount(BigDecimal.ZERO);
      quote.setGrandTotal(total);
      quote.setStaffNotes(staffNotes);
      quote.setCustomerResponseNote(customerNote);
      return quoteRepository.save(quote);
    });
  }

  private void ensureQuoteLine(Quote quote, int sortOrder, QuoteLineType type, String label, BigDecimal price, int qty) {
    boolean exists = quote.getLines().size() >= sortOrder;
    if (exists) {
      return;
    }
    QuoteLine line = new QuoteLine();
    line.setQuote(quote);
    line.setLineType(type);
    line.setDescription(label);
    line.setUnitPrice(price);
    line.setQuantity(BigDecimal.valueOf(qty));
    line.setLineTotal(price.multiply(BigDecimal.valueOf(qty)));
    if (type == QuoteLineType.PART) {
      line.setPart(null);
    }
    quote.getLines().add(line);
    quoteRepository.save(quote);
  }

  private Payment ensurePayment(String number, RepairOrder order, Quote quote, BigDecimal amount, PaymentMethod method, PaymentStatus status, String ref) {
    return paymentRepository.findAll().stream()
        .filter(p -> number.equals(p.getPaymentNumber()))
        .findFirst()
        .orElseGet(() -> {
          Payment payment = new Payment();
          payment.setPaymentNumber(number);
          payment.setRepairOrder(order);
          payment.setQuote(quote);
          payment.setAmount(amount);
          payment.setMethod(method);
          payment.setStatus(status);
          payment.setTransactionRef(ref);
          payment.setPaidAt(Instant.now());
          return paymentRepository.save(payment);
        });
  }

  private void ensurePartsRequest(String number, RepairOrder order, User staff, PartsRequestStatus status, String note, List<PartsRequestLineData> items) {
    if (partsRequestRepository.findByRequestNumber(number).isPresent()) {
      return;
    }
    PartsRequest request = new PartsRequest();
    request.setRequestNumber(number);
    request.setRepairOrder(order);
    request.setRequestedByStaff(staff);
    request.setStatus(status);
    request.setAdminNote(note);
    for (PartsRequestLineData item : items) {
      PartsRequestLine line = new PartsRequestLine();
      line.setPartsRequest(request);
      line.setPart(item.part());
      line.setQuantityRequested(item.quantity());
      line.setQuantityIssued(status == PartsRequestStatus.APPROVED ? item.quantity() : 0);
      request.getLines().add(line);
    }
    partsRequestRepository.save(request);
  }

  private void ensureSchedule(User staff, int dayOfWeek, LocalTime start, LocalTime end) {
    boolean exists = staffScheduleRepository.findByStaff_IdOrderByDayOfWeekAscStartTimeAsc(staff.getId()).stream()
        .anyMatch(s -> s.getDayOfWeek() == dayOfWeek && s.getStartTime().equals(start) && s.getEndTime().equals(end));
    if (exists) {
      return;
    }
    StaffSchedule schedule = new StaffSchedule();
    schedule.setStaff(staff);
    schedule.setDayOfWeek(dayOfWeek);
    schedule.setStartTime(start);
    schedule.setEndTime(end);
    staffScheduleRepository.save(schedule);
  }

  private void ensureRating(RepairOrder order, User customer, int rating, String comment) {
    if (serviceRatingRepository.findByRepairOrderId(order.getId()).isPresent()) {
      return;
    }
    ServiceRating serviceRating = new ServiceRating();
    serviceRating.setRepairOrder(order);
    serviceRating.setCustomer(customer);
    serviceRating.setRating(rating);
    serviceRating.setComment(comment);
    serviceRatingRepository.save(serviceRating);
  }

  private record PartsRequestLineData(Part part, int quantity) {}
}
