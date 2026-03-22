package com.garage.oto.web;

import com.garage.oto.domain.User;
import com.garage.oto.dto.quote.QuoteResponse;
import com.garage.oto.dto.quote.QuoteUpsertRequest;
import com.garage.oto.service.QuoteService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('STAFF')")
@RequiredArgsConstructor
public class StaffQuoteController {

  private final QuoteService quoteService;

  @GetMapping("/repair-orders/{repairOrderId}/quotes")
  public List<QuoteResponse> listForOrder(@PathVariable Long repairOrderId) {
    return quoteService.listForRepairOrder(repairOrderId);
  }

  @PostMapping("/repair-orders/{repairOrderId}/quotes")
  public QuoteResponse createDraft(
      @AuthenticationPrincipal User user, @PathVariable Long repairOrderId) {
    return quoteService.createDraft(user, repairOrderId);
  }

  @PutMapping("/quotes/{quoteId}/lines")
  public QuoteResponse saveLines(
      @AuthenticationPrincipal User user,
      @PathVariable Long quoteId,
      @Valid @RequestBody QuoteUpsertRequest req) {
    return quoteService.saveLines(user, quoteId, req);
  }

  @PostMapping("/quotes/{quoteId}/send")
  public QuoteResponse sendToCustomer(
      @AuthenticationPrincipal User user, @PathVariable Long quoteId) {
    return quoteService.sendToCustomer(user, quoteId);
  }
}
