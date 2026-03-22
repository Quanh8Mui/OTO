package com.garage.oto.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parts_request_lines")
@Getter
@Setter
public class PartsRequestLine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parts_request_id", nullable = false)
  private PartsRequest partsRequest;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "part_id", nullable = false)
  private Part part;

  @Column(name = "quantity_requested", nullable = false)
  private int quantityRequested;

  @Column(name = "quantity_issued", nullable = false)
  private int quantityIssued;
}
