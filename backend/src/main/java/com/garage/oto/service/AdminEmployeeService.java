package com.garage.oto.service;

import com.garage.oto.domain.Employee;
import com.garage.oto.domain.Role;
import com.garage.oto.domain.User;
import com.garage.oto.dto.admin.EmployeeRequest;
import com.garage.oto.dto.admin.EmployeeUpdateRequest;
import com.garage.oto.dto.admin.EmployeeResponse;
import com.garage.oto.repository.EmployeeRepository;
import com.garage.oto.repository.UserRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminEmployeeService {

  private final UserRepository userRepository;
  private final EmployeeRepository employeeRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminEmployeeService(
      UserRepository userRepository,
      EmployeeRepository employeeRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.employeeRepository = employeeRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<EmployeeResponse> list() {
    return employeeRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(AdminEmployeeService::toResponse)
        .toList();
  }

  @Transactional
  public EmployeeResponse create(EmployeeRequest req) {
    String employeeCode = normalizeEmployeeCode(req.employeeCode(), req.fullName());
    String password = req.password() != null && !req.password().isBlank() ? req.password() : defaultPassword();
    return createInternal(req, employeeCode, password);
  }

  private EmployeeResponse createInternal(EmployeeRequest req, String employeeCode, String password) {
    if (userRepository.existsByEmailIgnoreCase(req.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email exists");
    }
    if (employeeRepository.existsByEmployeeCode(employeeCode)) {
      throw new ApiException(HttpStatus.CONFLICT, "Employee code exists");
    }
    User u = new User();
    u.setEmail(req.email().trim().toLowerCase());
    u.setPasswordHash(passwordEncoder.encode(password));
    u.setFullName(req.fullName().trim());
    u.setPhone(req.phone());
    u.setRole(Role.STAFF);
    u.setActive(true);
    userRepository.save(u);
    Employee e = new Employee();
    e.setUser(u);
    e.setEmployeeCode(employeeCode);
    e.setPosition(req.position());
    employeeRepository.save(e);
    return toResponse(e);
  }

  private String normalizeEmployeeCode(String requestedCode, String fullName) {
    if (requestedCode != null && !requestedCode.isBlank()) {
      return requestedCode.trim().toUpperCase();
    }
    String base = "STF-" + initials(fullName);
    String candidate = base;
    int suffix = 1;
    while (employeeRepository.existsByEmployeeCode(candidate)) {
      candidate = base + "-" + String.format("%03d", suffix++);
    }
    return candidate;
  }

  private String initials(String fullName) {
    String cleaned = fullName == null ? "" : fullName.trim().replaceAll("\\s+", " ");
    if (cleaned.isBlank()) {
      return "001";
    }
    StringBuilder sb = new StringBuilder();
    for (String part : cleaned.split(" ")) {
      if (!part.isBlank()) sb.append(Character.toUpperCase(part.charAt(0)));
    }
    if (sb.length() == 0) sb.append("001");
    return sb.toString();
  }

  private String defaultPassword() {
    int token = ThreadLocalRandom.current().nextInt(100000, 999999);
    return "Stf@" + token;
  }

  @Transactional
  public EmployeeResponse update(Long id, EmployeeUpdateRequest req) {
    Employee e = employeeRepository.findById(id).orElseThrow(() -> notFound());
    User u = e.getUser();
    if (!u.getEmail().equalsIgnoreCase(req.email())
        && userRepository.existsByEmailIgnoreCase(req.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email exists");
    }
    if (!e.getEmployeeCode().equals(req.employeeCode())
        && employeeRepository.existsByEmployeeCode(req.employeeCode())) {
      throw new ApiException(HttpStatus.CONFLICT, "Employee code exists");
    }
    u.setEmail(req.email().trim().toLowerCase());
    if (req.password() != null && !req.password().isBlank()) {
      u.setPasswordHash(passwordEncoder.encode(req.password()));
    }
    u.setFullName(req.fullName().trim());
    u.setPhone(req.phone());
    e.setEmployeeCode(req.employeeCode().trim());
    e.setPosition(req.position());
    return toResponse(e);
  }

  @Transactional
  public void delete(Long id) {
    Employee e = employeeRepository.findById(id).orElseThrow(() -> notFound());
    employeeRepository.delete(e);
    userRepository.delete(e.getUser());
  }

  private static EmployeeResponse toResponse(Employee e) {
    User u = e.getUser();
    return new EmployeeResponse(
        e.getId(), u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), e.getEmployeeCode(), e.getPosition());
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Employee not found");
  }
}
