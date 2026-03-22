package com.garage.oto.config;

import com.garage.oto.domain.NotificationSetting;
import com.garage.oto.domain.Part;
import com.garage.oto.domain.Role;
import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.domain.User;
import com.garage.oto.repository.NotificationSettingRepository;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.repository.UserRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final ServiceCatalogRepository serviceCatalogRepository;
  private final PartRepository partRepository;
  private final NotificationSettingRepository notificationSettingRepository;

  @Override
  public void run(ApplicationArguments args) {
    if (userRepository.count() == 0) {
      User admin = new User();
      admin.setEmail("admin@garage.local");
      admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
      admin.setFullName("Administrator");
      admin.setRole(Role.ADMIN);
      admin.setActive(true);
      userRepository.save(admin);
    }
    if (serviceCatalogRepository.count() == 0) {
      seedService("BD-50K", "Bảo dưỡng 50.000 km", "Lọc dầu, lọc gió, kiểm tra tổng quát", new BigDecimal("2500000"));
      seedService("BD-40K", "Bảo dưỡng 40.000 km", "Định kỳ theo hãng", new BigDecimal("2100000"));
      seedService("CHK-GEN", "Kiểm tra tổng quát", "Đọc lỗi, kiểm tra cơ bản", new BigDecimal("350000"));
    }
    if (partRepository.count() == 0) {
      seedPart("OIL-5W30", "Dầu động cơ 5W-30", new BigDecimal("180000"), 40, 5);
      seedPart("FIL-AIR", "Lọc gió động cơ", new BigDecimal("120000"), 25, 5);
      seedPart("BRK-PAD-F", "Má phanh trước", new BigDecimal("890000"), 12, 2);
    }
    if (notificationSettingRepository.count() == 0) {
      seedNotif("BOOKING_CONFIRMED", "Đặt lịch thành công");
      seedNotif("QUOTE_READY", "Báo giá đã sẵn sàng");
      seedNotif("REPAIR_STATUS", "Cập nhật tiến độ sửa chữa");
    }
  }

  private void seedService(String code, String name, String desc, BigDecimal price) {
    ServiceCatalogItem s = new ServiceCatalogItem();
    s.setCode(code);
    s.setName(name);
    s.setDescription(desc);
    s.setBasePrice(price);
    s.setActive(true);
    serviceCatalogRepository.save(s);
  }

  private void seedPart(String sku, String name, BigDecimal price, int qty, int min) {
    Part p = new Part();
    p.setSku(sku);
    p.setName(name);
    p.setUnitPrice(price);
    p.setQuantityOnHand(qty);
    p.setMinStock(min);
    p.setCategory("GENERAL");
    p.setActive(true);
    partRepository.save(p);
  }

  private void seedNotif(String key, String title) {
    NotificationSetting n = new NotificationSetting();
    n.setEventKey(key);
    n.setEnabled(true);
    n.setChannel("EMAIL");
    n.setTemplateSubject(title);
    n.setTemplateBody("Xin chào {{customerName}}, bạn có thông báo từ garage.");
    notificationSettingRepository.save(n);
  }
}
