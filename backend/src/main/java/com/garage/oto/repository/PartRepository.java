package com.garage.oto.repository;

import com.garage.oto.domain.Part;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartRepository extends JpaRepository<Part, Long> {

  List<Part> findByActiveTrueOrderByNameAsc();

  boolean existsBySkuIgnoreCase(String sku);
}
