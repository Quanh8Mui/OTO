package com.garage.oto.service;

import com.garage.oto.domain.ServiceCatalogItem;
import com.garage.oto.dto.admin.ServiceCatalogRequest;
import com.garage.oto.dto.admin.ServiceCatalogResponse;
import com.garage.oto.repository.ServiceCatalogRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceCatalogService {

  private final ServiceCatalogRepository serviceCatalogRepository;

  public AdminServiceCatalogService(ServiceCatalogRepository serviceCatalogRepository) {
    this.serviceCatalogRepository = serviceCatalogRepository;
  }

  public List<ServiceCatalogResponse> list() {
    return serviceCatalogRepository.findAll().stream()
        .map(AdminServiceCatalogService::toResponse)
        .toList();
  }

  @Transactional
  public ServiceCatalogResponse create(ServiceCatalogRequest req) {
    if (serviceCatalogRepository.existsByCodeIgnoreCase(req.code())) {
      throw new ApiException(HttpStatus.CONFLICT, "Code exists");
    }
    ServiceCatalogItem s = new ServiceCatalogItem();
    apply(s, req);
    serviceCatalogRepository.save(s);
    return toResponse(s);
  }

  @Transactional
  public ServiceCatalogResponse update(Long id, ServiceCatalogRequest req) {
    ServiceCatalogItem s =
        serviceCatalogRepository.findById(id).orElseThrow(() -> notFound());
    if (!s.getCode().equalsIgnoreCase(req.code())
        && serviceCatalogRepository.existsByCodeIgnoreCase(req.code())) {
      throw new ApiException(HttpStatus.CONFLICT, "Code exists");
    }
    apply(s, req);
    return toResponse(s);
  }

  @Transactional
  public void delete(Long id) {
    ServiceCatalogItem s =
        serviceCatalogRepository.findById(id).orElseThrow(() -> notFound());
    s.setActive(false);
  }

  private static void apply(ServiceCatalogItem s, ServiceCatalogRequest req) {
    s.setCode(req.code().trim());
    s.setName(req.name());
    s.setDescription(req.description());
    s.setBasePrice(req.basePrice());
    s.setActive(req.active());
  }

  private static ServiceCatalogResponse toResponse(ServiceCatalogItem s) {
    return new ServiceCatalogResponse(
        s.getId(), s.getCode(), s.getName(), s.getDescription(), s.getBasePrice(), s.isActive());
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Service not found");
  }
}
