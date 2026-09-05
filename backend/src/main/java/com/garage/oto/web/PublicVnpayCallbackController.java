package com.garage.oto.web;

import com.garage.oto.service.PaymentService;
import com.garage.oto.service.VnpayService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
  public void callback(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
    String frontendUrl = "http://localhost:5173/app/customer/payment";
    if (!vnpayService.verify(new HashMap<>(params))) {
      response.sendRedirect(frontendUrl + "?vnpayError=invalid_signature");
      return;
    }
    String responseCode = params.get("vnp_ResponseCode");
    String txnRef = params.get("vnp_TxnRef");
    if ("00".equals(responseCode)) {
      paymentService.completeByPaymentNumber(txnRef, params.get("vnp_TransactionNo"));
      response.sendRedirect(frontendUrl + "?vnpaySuccess=true&txnRef=" + txnRef);
      return;
    }
    response.sendRedirect(frontendUrl + "?vnpayError=" + responseCode);
  }
}
