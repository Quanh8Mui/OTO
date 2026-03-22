package com.garage.oto.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "quote_lines")
@Getter
@Setter
public class QuoteLine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "quote_id", nullable = false)
  private Quote quote;

  @Enumerated(EnumType.STRING)
  @Column(name = "line_type", nullable = false, length = 10)
  private QuoteLineType lineType;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "service_catalog_id")
  private ServiceCatalogItem serviceCatalog;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "part_id")
  private Part part;

  @Column(nullable = false, length = 500)
  private String description;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal lineTotal;
}
