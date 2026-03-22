package com.garage.oto.web;

import com.garage.oto.dto.admin.PartRequest;
import com.garage.oto.dto.admin.PartResponse;
import com.garage.oto.service.AdminPartService;
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
@RequestMapping("/api/admin/parts")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPartController {

  private final AdminPartService adminPartService;

  @GetMapping
  public List<PartResponse> list() {
    return adminPartService.list();
  }

  @PostMapping
  public PartResponse create(@Valid @RequestBody PartRequest req) {
    return adminPartService.create(req);
  }

  @PutMapping("/{id}")
  public PartResponse update(@PathVariable Long id, @Valid @RequestBody PartRequest req) {
    return adminPartService.update(id, req);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminPartService.delete(id);
  }
}
