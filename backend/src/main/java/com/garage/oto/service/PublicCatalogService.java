package com.garage.oto.service;

import com.garage.oto.dto.catalog.PublicPartResponse;
import com.garage.oto.dto.catalog.PublicServiceResponse;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.repository.ServiceCatalogRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PublicCatalogService {

  private final ServiceCatalogRepository serviceCatalogRepository;
  private final PartRepository partRepository;

  public PublicCatalogService(ServiceCatalogRepository serviceCatalogRepository, PartRepository partRepository) {
    this.serviceCatalogRepository = serviceCatalogRepository;
    this.partRepository = partRepository;
  }

  public List<PublicServiceResponse> listActiveServices() {
    return serviceCatalogRepository.findByActiveTrueOrderByNameAsc().stream()
        .map(s -> new PublicServiceResponse(s.getId(), s.getCode(), s.getName(), s.getDescription(), s.getBasePrice()))
        .toList();
  }

  public List<PublicPartResponse> listActiveParts() {
    return partRepository.findByActiveTrueOrderByNameAsc().stream()
        .map(p -> new PublicPartResponse(p.getId(), p.getSku(), p.getName(), p.getUnitPrice()))
        .toList();
  }
}
