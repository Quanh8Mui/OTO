package com.garage.oto.dto.parts;

public record PartsRequestLineResponse(
    Long id, Long partId, String partName, String sku, int quantityRequested, int quantityIssued) {}
