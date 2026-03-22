package com.garage.oto.repository;

import com.garage.oto.domain.Employee;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

  Optional<Employee> findByUser_Id(Long userId);

  Optional<Employee> findByEmployeeCode(String code);

  boolean existsByEmployeeCode(String code);
}
