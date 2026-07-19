package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Oglindă a `Offer` din api-contract.md. */
public record OfferResponse(
        String id,
        String groupId,
        String name,
        String store,
        BigDecimal unitPrice,
        BigDecimal quantity,
        String productUrl,
        List<String> images,
        String notes,
        Instant createdAt
) {
}
