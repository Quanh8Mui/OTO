package com.garage.oto.web;

import com.garage.oto.dto.admin.ServiceCatalogRequest;
import com.garage.oto.dto.admin.ServiceCatalogResponse;
import com.garage.oto.service.AdminServiceCatalogService;
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
@RequestMapping("/api/admin/service-catalog")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminServiceCatalogController {

  private final AdminServiceCatalogService adminServiceCatalogService;

  @GetMapping
  public List<ServiceCatalogResponse> list() {
    return adminServiceCatalogService.list();
  }

  @PostMapping
  public ServiceCatalogResponse create(@Valid @RequestBody ServiceCatalogRequest req) {
    return adminServiceCatalogService.create(req);
  }

  @PutMapping("/{id}")
  public ServiceCatalogResponse update(
      @PathVariable Long id, @Valid @RequestBody ServiceCatalogRequest req) {
    return adminServiceCatalogService.update(id, req);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminServiceCatalogService.delete(id);
  }
}
