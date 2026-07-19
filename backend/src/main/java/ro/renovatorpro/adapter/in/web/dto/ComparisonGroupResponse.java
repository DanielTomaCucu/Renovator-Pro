package ro.renovatorpro.adapter.in.web.dto;

import java.time.Instant;
import java.util.List;

/** Oglindă a {@code ComparisonGroup} din api-contract.md, cu ofertele nested (un singur GET pentru toată pagina). */
public record ComparisonGroupResponse(
        String id,
        String roomId,
        String name,
        String materialType,
        String status,
        String chosenOfferId,
        String createdItemId,
        Instant createdAt,
        List<OfferResponse> offers
) {
}
