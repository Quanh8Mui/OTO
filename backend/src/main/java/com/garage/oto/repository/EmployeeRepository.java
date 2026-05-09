package com.garage.oto.repository;

import com.garage.oto.domain.Employee;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

  @EntityGraph(attributePaths = {"user"})
  List<Employee> findAllByOrderByCreatedAtDesc();

  Optional<Employee> findByUser_Id(Long userId);

  Optional<Employee> findByEmployeeCode(String code);

  boolean existsByEmployeeCode(String code);
}
