package com.garage.oto.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
public class NotificationSetting {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "event_key", nullable = false, unique = true, length = 64)
  private String eventKey;

  @Column(nullable = false)
  private boolean enabled = true;

  @Column(nullable = false, length = 20)
  private String channel = "EMAIL";

  @Column(name = "template_subject")
  private String templateSubject;

  @Column(name = "template_body", columnDefinition = "TEXT")
  private String templateBody;
}
