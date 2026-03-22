package com.garage.oto.repository;

import com.garage.oto.domain.ServiceCatalogItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalogItem, Long> {

  List<ServiceCatalogItem> findByActiveTrueOrderByNameAsc();

  boolean existsByCodeIgnoreCase(String code);
}
