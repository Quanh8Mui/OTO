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
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parts_requests")
@Getter
@Setter
public class PartsRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "request_number", nullable = false, unique = true, length = 30)
  private String requestNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "repair_order_id", nullable = false)
  private RepairOrder repairOrder;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "requested_by_staff_id", nullable = false)
  private User requestedByStaff;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PartsRequestStatus status = PartsRequestStatus.PENDING;

  @Column(name = "admin_note", columnDefinition = "TEXT")
  private String adminNote;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "fulfilled_at")
  private Instant fulfilledAt;

  @OneToMany(mappedBy = "partsRequest", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<PartsRequestLine> lines = new ArrayList<>();
}
