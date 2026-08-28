package com.garage.oto.web;

import com.garage.oto.service.PaymentService;
import com.garage.oto.service.VnpayService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Public endpoint for VNPay return callback.
 * VNPay redirects the browser here after payment — no JWT is available,
 * so authentication relies on the VNPay HMAC signature instead.
 */
@RestController
@RequestMapping("/api/public/vnpay")
@RequiredArgsConstructor
public class PublicVnpayCallbackController {

  private final PaymentService paymentService;
  private final VnpayService vnpayService;

  @GetMapping("/return")
  public Map<String, Object> callback(@RequestParam Map<String, String> params) {
    if (!vnpayService.verify(new HashMap<>(params))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid VNPay signature");
    }
    String responseCode = params.get("vnp_ResponseCode");
    String txnRef = params.get("vnp_TxnRef");
    if ("00".equals(responseCode)) {
      paymentService.completeByPaymentNumber(txnRef, params.get("vnp_TransactionNo"));
      return Map.of("success", true, "message", "Thanh toán thành công", "txnRef", txnRef);
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VNPay payment failed: code " + responseCode);
  }
}
