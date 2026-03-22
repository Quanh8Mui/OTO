package com.garage.oto.service;

import com.garage.oto.domain.Role;
import com.garage.oto.domain.StaffSchedule;
import com.garage.oto.domain.User;
import com.garage.oto.dto.schedule.StaffScheduleRequest;
import com.garage.oto.dto.schedule.StaffScheduleResponse;
import com.garage.oto.repository.StaffScheduleRepository;
import com.garage.oto.repository.UserRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffScheduleService {

  private final StaffScheduleRepository staffScheduleRepository;
  private final UserRepository userRepository;

  public StaffScheduleService(
      StaffScheduleRepository staffScheduleRepository, UserRepository userRepository) {
    this.staffScheduleRepository = staffScheduleRepository;
    this.userRepository = userRepository;
  }

  public List<StaffScheduleResponse> listForStaff(User staff) {
    return staffScheduleRepository.findByStaff_IdOrderByDayOfWeekAscStartTimeAsc(staff.getId()).stream()
        .map(StaffScheduleService::toResponse)
        .toList();
  }

  public List<StaffScheduleResponse> listForStaffId(Long staffUserId) {
    User u =
        userRepository.findById(staffUserId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User"));
    if (u.getRole() != Role.STAFF) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Not a staff user");
    }
    return staffScheduleRepository.findByStaff_IdOrderByDayOfWeekAscStartTimeAsc(u.getId()).stream()
        .map(StaffScheduleService::toResponse)
        .toList();
  }

  @Transactional
  public StaffScheduleResponse upsert(User staff, StaffScheduleRequest req) {
    StaffSchedule s = new StaffSchedule();
    s.setStaff(staff);
    s.setDayOfWeek(req.dayOfWeek());
    s.setStartTime(req.startTime());
    s.setEndTime(req.endTime());
    staffScheduleRepository.save(s);
    return toResponse(s);
  }

  @Transactional
  public void delete(User staff, Long id) {
    StaffSchedule s = staffScheduleRepository.findById(id).orElseThrow(() -> notFound());
    if (!s.getStaff().getId().equals(staff.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
    }
    staffScheduleRepository.delete(s);
  }

  private static StaffScheduleResponse toResponse(StaffSchedule s) {
    return new StaffScheduleResponse(s.getId(), s.getDayOfWeek(), s.getStartTime(), s.getEndTime());
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Schedule not found");
  }
}
