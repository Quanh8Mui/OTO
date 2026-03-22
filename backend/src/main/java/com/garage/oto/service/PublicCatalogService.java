package com.garage.oto.service;

import com.garage.oto.dto.catalog.PublicServiceResponse;
import com.garage.oto.repository.ServiceCatalogRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PublicCatalogService {

  private final ServiceCatalogRepository serviceCatalogRepository;

  public PublicCatalogService(ServiceCatalogRepository serviceCatalogRepository) {
    this.serviceCatalogRepository = serviceCatalogRepository;
  }

  public List<PublicServiceResponse> listActiveServices() {
    return serviceCatalogRepository.findByActiveTrueOrderByNameAsc().stream()
        .map(
            s ->
                new PublicServiceResponse(
                    s.getId(), s.getCode(), s.getName(), s.getDescription(), s.getBasePrice()))
        .toList();
  }
}
