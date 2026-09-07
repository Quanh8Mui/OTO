package com.garage.oto.web;

import com.garage.oto.dto.admin.NotificationSettingResponse;
import com.garage.oto.dto.admin.NotificationSettingUpdateRequest;
import com.garage.oto.dto.admin.SmtpStatusResponse;
import com.garage.oto.dto.admin.TestEmailRequest;
import com.garage.oto.service.EmailService;
import com.garage.oto.service.NotificationSettingsService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notification-settings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminNotificationController {

  private final NotificationSettingsService notificationSettingsService;
  private final EmailService emailService;

  @GetMapping
  public List<NotificationSettingResponse> list() {
    return notificationSettingsService.list();
  }

  @PutMapping("/{id}")
  public NotificationSettingResponse update(
      @PathVariable Long id, @Valid @RequestBody NotificationSettingUpdateRequest req) {
    return notificationSettingsService.update(id, req);
  }

  @GetMapping("/smtp-status")
  public SmtpStatusResponse getSmtpStatus() {
    return emailService.getSmtpStatus();
  }

  @PostMapping("/test-email")
  public Map<String, String> sendTestEmail(@Valid @RequestBody TestEmailRequest req) {
    emailService.sendTestEmail(req.toEmail());
    return Map.of("message", "Email thử nghiệm đã được gửi thành công đến: " + req.toEmail());
  }
}
