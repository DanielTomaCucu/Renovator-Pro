package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;

/** Oglindă a `Item` din api-contract.md. */
public record ItemResponse(
        String id,
        String roomId,
        String name,
        String materialType,
        String source,
        String status,
        BigDecimal quantity,
        BigDecimal unitPrice,
        String productUrl,
        String imageUrl,
        String origin
) {
}
