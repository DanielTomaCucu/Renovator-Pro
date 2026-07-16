package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Oglindă a `Item` din api-contract.md. {@code createdAt}/{@code purchasedAt} sunt tipuri JDK (nu
 * enum-uri de domeniu) — serializate direct de Jackson ca ISO-8601, fără conversie via DtoConversionSupport
 * (la fel ca `Double floorArea` pe `RoomResponse`).
 */
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
        String origin,
        Instant createdAt,
        Instant purchasedAt
) {
}
