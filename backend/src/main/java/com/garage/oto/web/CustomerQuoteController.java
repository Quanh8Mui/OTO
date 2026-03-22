package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.quote.QuoteDecisionRequest;
import com.garage.oto.dto.quote.QuoteResponse;
import com.garage.oto.service.QuoteService;
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
@RequestMapping("/api/customer/quotes")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerQuoteController {

  private final QuoteService quoteService;

  @GetMapping
  public List<QuoteResponse> list(@AuthenticationPrincipal User user) {
    return quoteService.listForCustomer(user);
  }

  @GetMapping("/{id}")
  public QuoteResponse get(@AuthenticationPrincipal User user, @PathVariable Long id) {
    return quoteService.getForCustomer(user, id);
  }

  @PostMapping("/{id}/approve")
  public QuoteResponse approve(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @RequestBody(required = false) QuoteDecisionRequest req) {
    return quoteService.approve(user, id, req != null ? req : new QuoteDecisionRequest(null, null));
  }

  @PostMapping("/{id}/reject")
  public QuoteResponse reject(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @RequestBody(required = false) QuoteDecisionRequest req) {
    return quoteService.reject(user, id, req != null ? req : new QuoteDecisionRequest(null, null));
  }
}
