package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.payment.PaymentCompleteRequest;
import com.garage.oto.dto.payment.PaymentCreateRequest;
import com.garage.oto.dto.payment.PaymentResponse;
import com.garage.oto.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/payments")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerPaymentController {

  private final PaymentService paymentService;

  @GetMapping
  public List<PaymentResponse> list(@AuthenticationPrincipal User user) {
    return paymentService.listForCustomer(user);
  }

  @PostMapping
  public PaymentResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody PaymentCreateRequest req) {
    return paymentService.create(user, req);
  }

  @PostMapping("/{id}/complete")
  public PaymentResponse complete(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @Valid @RequestBody PaymentCompleteRequest req) {
    return paymentService.complete(user, id, req);
  }
}
