package com.garage.oto.web;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.garage.oto.dto.admin.PartResponse;
import com.garage.oto.service.AdminPartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff/parts")
@PreAuthorize("hasRole('STAFF')")
@RequiredArgsConstructor
public class StaffPartController {

  private final AdminPartService adminPartService;

  @GetMapping
  public List<PartResponse> list() {
    return adminPartService.list();
  }
}
