package com.garage.oto.service;

import com.garage.oto.domain.Booking;
import com.garage.oto.domain.NotificationSetting;
import com.garage.oto.domain.Quote;
import com.garage.oto.domain.RepairOrder;
import com.garage.oto.domain.RepairProgressEvent;
import com.garage.oto.dto.admin.SmtpStatusResponse;
import com.garage.oto.repository.NotificationSettingRepository;
import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);
  private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getNumberInstance(new Locale("vi", "VN"));

  private final ObjectProvider<JavaMailSender> mailSenderProvider;
  private final NotificationSettingRepository notificationSettingRepository;

  @Value("${spring.mail.username:}")
  private String mailUsername;

  @Value("${spring.mail.password:}")
  private String mailPassword;

  @Value("${spring.mail.host:smtp.gmail.com}")
  private String mailHost;

  @Value("${spring.mail.port:587}")
  private int mailPort;

  @Value("${app.mail.from:}")
  private String mailFrom;

  @Value("${app.mail.sender-name:OTO Garage Auto Care}")
  private String senderName;

  public EmailService(
      ObjectProvider<JavaMailSender> mailSenderProvider,
      NotificationSettingRepository notificationSettingRepository) {
    this.mailSenderProvider = mailSenderProvider;
    this.notificationSettingRepository = notificationSettingRepository;
  }

  public boolean isSmtpConfigured() {
    return mailUsername != null && !mailUsername.isBlank()
        && mailPassword != null && !mailPassword.isBlank();
  }

  public SmtpStatusResponse getSmtpStatus() {
    String maskedUser = "";
    if (mailUsername != null && !mailUsername.isBlank()) {
      int atIdx = mailUsername.indexOf('@');
      if (atIdx > 2) {
        maskedUser = mailUsername.substring(0, 2) + "***" + mailUsername.substring(atIdx);
      } else {
        maskedUser = mailUsername;
      }
    }
    String effectiveFrom = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
    return new SmtpStatusResponse(
        isSmtpConfigured(),
        mailHost,
        mailPort,
        maskedUser,
        effectiveFrom,
        senderName
    );
  }

  /**
   * Send test email to verify SMTP connection.
   */
  public void sendTestEmail(String targetEmail) {
    if (!isSmtpConfigured()) {
      throw new IllegalStateException("Hệ thống chưa được cấu hình tài khoản gửi thư SMTP (thiếu MAIL_USERNAME hoặc MAIL_PASSWORD).");
    }
    String subject = "[OTO Garage] Thử nghiệm kết nối gửi Email tự động";
    String htmlContent = buildEmailShell(
        "Thử nghiệm gửi email thành công!",
        "<p>Xin chào,</p>"
            + "<p>Email này được gửi từ hệ thống <strong>OTO Garage Auto Care</strong> để xác minh cấu hình máy chủ thư SMTP.</p>"
            + "<div style=\"background: #f4eef9; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #ded4ec;\">"
            + "<p style=\"margin: 4px 0;\"><strong>Máy chủ SMTP:</strong> " + mailHost + ":" + mailPort + "</p>"
            + "<p style=\"margin: 4px 0;\"><strong>Tài khoản gửi:</strong> " + mailUsername + "</p>"
            + "<p style=\"margin: 4px 0;\"><strong>Trạng thái:</strong> <span style=\"color: #16a34a; font-weight: bold;\">Kết nối thành công & Sẵn sàng hoạt động</span></p>"
            + "</div>"
            + "<p>Các thông báo tự động (Xác nhận đặt lịch, Báo giá, Cập nhật tiến độ) sẽ hoạt động bình thường khi sự kiện phát sinh.</p>"
    );
    sendHtmlDirect(targetEmail, subject, htmlContent);
  }

  /**
   * Triggered when booking is confirmed or created.
   */
  @Async
  public void sendBookingConfirmedEmail(Booking booking) {
    if (!isEventEmailEnabled("BOOKING_CONFIRMED")) {
      log.info("Email notification for BOOKING_CONFIRMED is disabled, skipping for booking: {}", booking.getBookingNumber());
      return;
    }
    if (booking.getCustomer() == null || booking.getCustomer().getEmail() == null || booking.getCustomer().getEmail().isBlank()) {
      log.warn("Customer email is missing for booking {}", booking.getBookingNumber());
      return;
    }

    String customerEmail = booking.getCustomer().getEmail();
    String customerName = booking.getCustomer().getFullName();
    String licensePlate = booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : "Chưa rõ";
    String vehicleModel = booking.getVehicle() != null ? (booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel()) : "";
    String serviceName = booking.getServiceCatalog() != null ? booking.getServiceCatalog().getName() : (booking.getServiceTypeLabel() != null ? booking.getServiceTypeLabel() : (booking.getNotes() != null ? booking.getNotes() : "Bảo dưỡng - Sửa chữa"));
    String dateStr = booking.getRequestedDate() != null ? booking.getRequestedDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
    String timeSlot = booking.getTimeSlot() != null ? booking.getTimeSlot() : "Giờ hành chính";

    String subject = String.format("[OTO Garage] Xác nhận lịch hẹn dịch vụ xe %s - Mã: %s", licensePlate, booking.getBookingNumber());

    String body = String.format(
        "<p>Kính gửi Quý khách <strong>%s</strong>,</p>"
            + "<p>Lịch hẹn dịch vụ của Quý khách tại <strong>OTO Garage Auto Care</strong> đã được tiếp nhận và xác nhận vào hệ thống.</p>"
            + "<div style=\"background: #faf8fd; padding: 18px; border-radius: 12px; margin: 18px 0; border: 1px solid #e8e2f2;\">"
            + "<table style=\"width: 100%%; border-collapse: collapse; font-size: 14px;\">"
            + "<tr><td style=\"padding: 6px 0; color: #796e85; width: 140px;\">Mã lịch hẹn:</td><td style=\"padding: 6px 0; font-weight: bold; color: #533c6e;\">%s</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Biển số xe:</td><td style=\"padding: 6px 0; font-weight: bold;\">%s (%s)</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Ngày hẹn:</td><td style=\"padding: 6px 0; font-weight: bold;\">%s</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Khung giờ:</td><td style=\"padding: 6px 0; font-weight: bold;\">%s</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Dịch vụ yêu cầu:</td><td style=\"padding: 6px 0;\">%s</td></tr>"
            + "</table>"
            + "</div>"
            + "<p>Quý khách vui lòng mang xe đến xưởng đúng giờ hẹn để kỹ thuật viên kiểm tra và chăm sóc chu đáo nhất.</p>",
        customerName, booking.getBookingNumber(), licensePlate, vehicleModel, dateStr, timeSlot, serviceName
    );

    String html = buildEmailShell("Xác nhận lịch hẹn dịch vụ", body);
    sendHtmlSafe(customerEmail, subject, html);
  }

  /**
   * Triggered when a quote is prepared and sent to customer.
   */
  @Async
  public void sendQuoteReadyEmail(Quote quote) {
    if (!isEventEmailEnabled("QUOTE_READY")) {
      log.info("Email notification for QUOTE_READY is disabled, skipping for quote: {}", quote.getQuoteNumber());
      return;
    }

    RepairOrder ro = quote.getRepairOrder();
    if (ro == null || ro.getCustomer() == null || ro.getCustomer().getEmail() == null || ro.getCustomer().getEmail().isBlank()) {
      log.warn("Customer email is missing for quote {}", quote.getQuoteNumber());
      return;
    }

    String customerEmail = ro.getCustomer().getEmail();
    String customerName = ro.getCustomer().getFullName();
    String licensePlate = ro.getVehicle() != null ? ro.getVehicle().getLicensePlate() : "Xe của bạn";
    String totalMoney = CURRENCY_FORMAT.format(quote.getGrandTotal() != null ? quote.getGrandTotal() : 0);
    String laborMoney = CURRENCY_FORMAT.format(quote.getLaborTotal() != null ? quote.getLaborTotal() : 0);
    String partsMoney = CURRENCY_FORMAT.format(quote.getPartsTotal() != null ? quote.getPartsTotal() : 0);

    String subject = String.format("[OTO Garage] Báo giá dịch vụ xe %s đã sẵn sàng - Mã: %s", licensePlate, quote.getQuoteNumber());

    String body = String.format(
        "<p>Kính gửi Quý khách <strong>%s</strong>,</p>"
            + "<p>Kỹ thuật viên tại <strong>OTO Garage</strong> đã hoàn tất việc kiểm tra tổng quát xe <strong>%s</strong> và lập bảng báo giá chi tiết.</p>"
            + "<div style=\"background: #faf8fd; padding: 18px; border-radius: 12px; margin: 18px 0; border: 1px solid #e8e2f2;\">"
            + "<table style=\"width: 100%%; border-collapse: collapse; font-size: 14px;\">"
            + "<tr><td style=\"padding: 6px 0; color: #796e85; width: 140px;\">Mã báo giá:</td><td style=\"padding: 6px 0; font-weight: bold;\">%s</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Tiền công thợ:</td><td style=\"padding: 6px 0;\">%s đ</td></tr>"
            + "<tr><td style=\"padding: 6px 0; color: #796e85;\">Tiền phụ tùng:</td><td style=\"padding: 6px 0;\">%s đ</td></tr>"
            + "<tr style=\"border-top: 1px dashed #e8e2f2;\"><td style=\"padding: 10px 0; font-weight: bold; color: #533c6e;\">Tổng chi phí:</td><td style=\"padding: 10px 0; font-weight: 800; font-size: 16px; color: #c62828;\">%s đ</td></tr>"
            + "</table>"
            + "</div>"
            + "<p>Quý khách vui lòng đăng nhập vào tài khoản khách hàng để xem chi tiết từng hạng mục và bấm xác nhận duyệt báo giá để xưởng bắt đầu thực hiện.</p>",
        customerName, licensePlate, quote.getQuoteNumber(), laborMoney, partsMoney, totalMoney
    );

    String html = buildEmailShell("Báo giá dịch vụ đã sẵn sàng", body);
    sendHtmlSafe(customerEmail, subject, html);
  }

  /**
   * Triggered when repair progress changes.
   */
  @Async
  public void sendRepairProgressEmail(RepairOrder ro, RepairProgressEvent event) {
    if (!isEventEmailEnabled("REPAIR_STATUS")) {
      return;
    }

    if (ro == null || ro.getCustomer() == null || ro.getCustomer().getEmail() == null || ro.getCustomer().getEmail().isBlank()) {
      return;
    }

    String customerEmail = ro.getCustomer().getEmail();
    String customerName = ro.getCustomer().getFullName();
    String licensePlate = ro.getVehicle() != null ? ro.getVehicle().getLicensePlate() : "Xe của bạn";
    String title = event != null && event.getStepLabel() != null ? event.getStepLabel() : "Cập nhật tiến độ sửa chữa";
    String note = event != null && event.getMessage() != null ? event.getMessage() : "Kỹ thuật viên đang tiếp tục công việc tại xưởng.";

    String subject = String.format("[OTO Garage] Tiến độ sửa chữa xe %s: %s", licensePlate, title);

    String body = String.format(
        "<p>Kính gửi Quý khách <strong>%s</strong>,</p>"
            + "<p>Tiến độ sửa chữa - bảo dưỡng xe <strong>%s</strong> (Lệnh: %s) vừa có cập nhật mới:</p>"
            + "<div style=\"background: #faf8fd; padding: 18px; border-radius: 12px; margin: 18px 0; border: 1px solid #e8e2f2;\">"
            + "<h3 style=\"margin: 0 0 8px; color: #533c6e; font-size: 16px;\">%s</h3>"
            + "<p style=\"margin: 0; color: #282033; line-height: 1.5;\">%s</p>"
            + "</div>"
            + "<p>Quý khách có thể truy cập hệ thống để xem nhật ký ảnh và mốc thời gian chi tiết.</p>",
        customerName, licensePlate, ro.getOrderNumber(), title, note
    );

    String html = buildEmailShell("Cập nhật tiến độ sửa chữa", body);
    sendHtmlSafe(customerEmail, subject, html);
  }

  private boolean isEventEmailEnabled(String eventKey) {
    Optional<NotificationSetting> opt = notificationSettingRepository.findByEventKey(eventKey);
    if (opt.isEmpty()) return false;
    NotificationSetting s = opt.get();
    return s.isEnabled() && s.getChannel() != null && s.getChannel().toUpperCase().contains("EMAIL");
  }

  private void sendHtmlSafe(String toEmail, String subject, String htmlContent) {
    try {
      if (!isSmtpConfigured()) {
        log.warn("SMTP credentials not configured. Email to {} with subject '{}' was skipped.", toEmail, subject);
        return;
      }
      sendHtmlDirect(toEmail, subject, htmlContent);
      log.info("Email sent successfully to {} with subject '{}'", toEmail, subject);
    } catch (Exception e) {
      log.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
    }
  }

  private void sendHtmlDirect(String toEmail, String subject, String htmlContent) {
    JavaMailSender sender = mailSenderProvider.getIfAvailable();
    if (sender == null) {
      throw new IllegalStateException("JavaMailSender bean is not available.");
    }
    try {
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      String effectiveFrom = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
      helper.setFrom(effectiveFrom, senderName);
      helper.setTo(toEmail);
      helper.setSubject(subject);
      helper.setText(htmlContent, true);

      sender.send(message);
    } catch (Exception ex) {
      throw new RuntimeException("Lỗi gửi email: " + ex.getMessage(), ex);
    }
  }

  /**
   * Professional HTML wrapper for OTO Garage emails.
   */
  private String buildEmailShell(String title, String innerHtml) {
    return "<!DOCTYPE html>"
        + "<html lang=\"vi\">"
        + "<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head>"
        + "<body style=\"margin: 0; padding: 0; background-color: #f6f4f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #282033;\">"
        + "<div style=\"max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(83, 60, 110, 0.08); border: 1px solid #e8e2f2;\">"
        + "  <div style=\"background: linear-gradient(135deg, #533c6e 0%, #3f2a58 100%); padding: 24px 28px; text-align: left;\">"
        + "    <h1 style=\"margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.01em;\">OTO GARAGE AUTO CARE</h1>"
        + "    <p style=\"margin: 4px 0 0; color: #dfd5ed; font-size: 13px;\">Hệ thống quản lý xưởng dịch vụ & Chăm sóc xe chuyên nghiệp</p>"
        + "  </div>"
        + "  <div style=\"padding: 28px 28px 20px;\">"
        + "    <h2 style=\"margin: 0 0 16px; color: #533c6e; font-size: 18px; font-weight: 700;\">" + title + "</h2>"
        + innerHtml
        + "  </div>"
        + "  <div style=\"background: #faf8fd; padding: 18px 28px; border-top: 1px solid #e8e2f2; text-align: center; font-size: 12px; color: #796e85;\">"
        + "    <p style=\"margin: 0 0 4px;\"><strong>OTO Garage Auto Care</strong> - Hotline: 0909 000 001</p>"
        + "    <p style=\"margin: 0;\">Email tự động từ hệ thống quản lý. Vui lòng không trả lời trực tiếp email này.</p>"
        + "  </div>"
        + "</div>"
        + "</body>"
        + "</html>";
  }
}
