package com.garage.oto.web;

import com.garage.oto.dto.admin.EmployeeRequest;
import com.garage.oto.dto.admin.EmployeeResponse;
import com.garage.oto.dto.admin.EmployeeUpdateRequest;
import com.garage.oto.service.AdminEmployeeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/employees")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminEmployeeController {

  private final AdminEmployeeService adminEmployeeService;

  @GetMapping
  public List<EmployeeResponse> list() {
    return adminEmployeeService.list();
  }

  @PostMapping
  public EmployeeResponse create(@Valid @RequestBody EmployeeRequest req) {
    return adminEmployeeService.create(req);
  }

  @PutMapping("/{id}")
  public EmployeeResponse update(
      @PathVariable Long id, @Valid @RequestBody EmployeeUpdateRequest req) {
    return adminEmployeeService.update(id, req);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminEmployeeService.delete(id);
  }
}
