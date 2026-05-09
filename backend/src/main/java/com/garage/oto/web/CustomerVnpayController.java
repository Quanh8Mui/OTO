package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.payment.VnpayCreateRequest;
import com.garage.oto.dto.payment.VnpayCreateResponse;
import com.garage.oto.service.PaymentService;
import com.garage.oto.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
    String returnUrl = "http://localhost:5173/app/customer/payment?vnpay=return";
    String url = vnpayService.createPaymentUrl(
        payment.getPaymentNumber(),
        req.orderInfo() != null ? req.orderInfo() : "Thanh toan don hang " + payment.getRepairOrder().getOrderNumber(),
        req.amount().longValue(),
        returnUrl);
    return new VnpayCreateResponse(url, payment.getPaymentNumber());
  }

  @GetMapping("/return")
  public String callback(@RequestParam Map<String, String> params) {
    if (!vnpayService.verify(new HashMap<>(params))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid VNPay signature");
    }
    String responseCode = params.get("vnp_ResponseCode");
    String txnRef = params.get("vnp_TxnRef");
    if ("00".equals(responseCode)) {
      paymentService.completeByPaymentNumber(txnRef, params.get("vnp_TransactionNo"));
      return "Thanh toan thanh cong";
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VNPay payment failed");
  }
}
