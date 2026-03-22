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
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "quotes")
@Getter
@Setter
public class Quote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "quote_number", nullable = false, unique = true, length = 30)
  private String quoteNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "repair_order_id", nullable = false)
  private RepairOrder repairOrder;

  @Column(nullable = false)
  private int version = 1;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private QuoteStatus status = QuoteStatus.DRAFT;

  @Column(name = "labor_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal laborTotal = BigDecimal.ZERO;

  @Column(name = "parts_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal partsTotal = BigDecimal.ZERO;

  @Column(name = "tax_rate", nullable = false, precision = 8, scale = 4)
  private BigDecimal taxRate = BigDecimal.ZERO;

  @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal taxAmount = BigDecimal.ZERO;

  @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal grandTotal = BigDecimal.ZERO;

  @Column(name = "staff_notes", columnDefinition = "TEXT")
  private String staffNotes;

  @Column(name = "customer_response_note", columnDefinition = "TEXT")
  private String customerResponseNote;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "sent_at")
  private Instant sentAt;

  @Column(name = "approved_at")
  private Instant approvedAt;

  @Column(name = "rejected_at")
  private Instant rejectedAt;

  @Column(name = "rejected_reason", columnDefinition = "TEXT")
  private String rejectedReason;

  @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<QuoteLine> lines = new ArrayList<>();
}
