package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.payment.VnpayCreateRequest;
import com.garage.oto.dto.payment.VnpayCreateResponse;
import com.garage.oto.service.PaymentService;
import com.garage.oto.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated endpoint for creating VNPay payment requests.
 * The callback/return URL is handled by {@link PublicVnpayCallbackController}
 * because VNPay redirects cannot carry a JWT.
 */
@RestController
@RequestMapping("/api/customer/vnpay")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerVnpayController {

  private final PaymentService paymentService;
  private final VnpayService vnpayService;

  @PostMapping("/create")
  public VnpayCreateResponse create(
      @AuthenticationPrincipal User user, @Valid @RequestBody VnpayCreateRequest req, HttpServletRequest request) {
    var payment = paymentService.createVnpayPending(user, req);
    // VNPay will redirect here after payment — handled by PublicVnpayCallbackController
    String returnUrl = request.getScheme() + "://" + request.getServerName()
        + ":" + request.getServerPort() + "/api/public/vnpay/return";
    String url = vnpayService.createPaymentUrl(
        payment.getPaymentNumber(),
        req.orderInfo() != null ? req.orderInfo() : "Thanh toan don hang " + payment.getRepairOrder().getOrderNumber(),
        req.amount().longValue(),
        returnUrl);
    return new VnpayCreateResponse(url, payment.getPaymentNumber());
  }

  @PostMapping("/mock-complete")
  public com.garage.oto.dto.payment.PaymentResponse mockComplete(
      @AuthenticationPrincipal User user,
      @RequestBody java.util.Map<String, String> payload) {
    String paymentRef = payload.get("paymentRef");
    if (paymentRef == null || paymentRef.isBlank()) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.BAD_REQUEST, "paymentRef is required");
    }
    return paymentService.mockCompleteByCustomer(user, paymentRef);
  }
}
