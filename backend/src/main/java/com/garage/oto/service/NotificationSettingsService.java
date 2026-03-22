package com.garage.oto.service;

import com.garage.oto.domain.NotificationSetting;
import com.garage.oto.dto.admin.NotificationSettingResponse;
import com.garage.oto.dto.admin.NotificationSettingUpdateRequest;
import com.garage.oto.repository.NotificationSettingRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationSettingsService {

  private final NotificationSettingRepository notificationSettingRepository;

  public NotificationSettingsService(NotificationSettingRepository notificationSettingRepository) {
    this.notificationSettingRepository = notificationSettingRepository;
  }

  public List<NotificationSettingResponse> list() {
    return notificationSettingRepository.findAll().stream()
        .map(NotificationSettingsService::toResponse)
        .toList();
  }

  @Transactional
  public NotificationSettingResponse update(Long id, NotificationSettingUpdateRequest req) {
    NotificationSetting s =
        notificationSettingRepository.findById(id).orElseThrow(() -> notFound());
    s.setEnabled(req.enabled());
    if (req.channel() != null) {
      s.setChannel(req.channel());
    }
    if (req.templateSubject() != null) {
      s.setTemplateSubject(req.templateSubject());
    }
    if (req.templateBody() != null) {
      s.setTemplateBody(req.templateBody());
    }
    return toResponse(s);
  }

  private static NotificationSettingResponse toResponse(NotificationSetting s) {
    return new NotificationSettingResponse(
        s.getId(), s.getEventKey(), s.isEnabled(), s.getChannel(), s.getTemplateSubject(), s.getTemplateBody());
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Setting not found");
  }
}
