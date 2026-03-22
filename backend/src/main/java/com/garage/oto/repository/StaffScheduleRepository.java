package com.garage.oto.repository;

import com.garage.oto.domain.StaffSchedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {

  List<StaffSchedule> findByStaff_IdOrderByDayOfWeekAscStartTimeAsc(Long staffId);
}
