package com.garage.oto.service;

import com.garage.oto.domain.Part;
import com.garage.oto.dto.admin.PartRequest;
import com.garage.oto.dto.admin.PartResponse;
import com.garage.oto.repository.PartRepository;
import com.garage.oto.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminPartService {

  private final PartRepository partRepository;

  public AdminPartService(PartRepository partRepository) {
    this.partRepository = partRepository;
  }

  public List<PartResponse> list() {
    return partRepository.findAll().stream().map(AdminPartService::toResponse).toList();
  }

  @Transactional
  public PartResponse create(PartRequest req) {
    if (partRepository.existsBySkuIgnoreCase(req.sku())) {
      throw new ApiException(HttpStatus.CONFLICT, "SKU exists");
    }
    Part p = new Part();
    apply(p, req);
    partRepository.save(p);
    return toResponse(p);
  }

  @Transactional
  public PartResponse update(Long id, PartRequest req) {
    Part p = partRepository.findById(id).orElseThrow(() -> notFound());
    if (!p.getSku().equalsIgnoreCase(req.sku()) && partRepository.existsBySkuIgnoreCase(req.sku())) {
      throw new ApiException(HttpStatus.CONFLICT, "SKU exists");
    }
    apply(p, req);
    return toResponse(p);
  }

  @Transactional
  public void delete(Long id) {
    Part p = partRepository.findById(id).orElseThrow(() -> notFound());
    p.setActive(false);
  }

  private static void apply(Part p, PartRequest req) {
    p.setSku(req.sku().trim());
    p.setName(req.name());
    p.setDescription(req.description());
    p.setUnitPrice(req.unitPrice());
    p.setQuantityOnHand(req.quantityOnHand());
    p.setMinStock(req.minStock());
    p.setCategory(req.category());
    p.setActive(req.active());
  }

  private static PartResponse toResponse(Part p) {
    return new PartResponse(
        p.getId(),
        p.getSku(),
        p.getName(),
        p.getDescription(),
        p.getUnitPrice(),
        p.getQuantityOnHand(),
        p.getMinStock(),
        p.getCategory(),
        p.isActive(),
        p.getUpdatedAt());
  }

  private ApiException notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, "Part not found");
  }
}
