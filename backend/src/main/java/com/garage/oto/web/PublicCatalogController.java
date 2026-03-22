package com.garage.oto.web;

import com.garage.oto.dto.catalog.PublicServiceResponse;
import com.garage.oto.service.PublicCatalogService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/catalog")
@RequiredArgsConstructor
public class PublicCatalogController {

  private final PublicCatalogService publicCatalogService;

  @GetMapping("/services")
  public List<PublicServiceResponse> listServices() {
    return publicCatalogService.listActiveServices();
  }
}
