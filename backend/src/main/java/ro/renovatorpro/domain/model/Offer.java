package ro.renovatorpro.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * O ofertă concretă dintr-un grup de comparație. TOATE câmpurile descriptive sunt opționale (nullable) —
 * fluxul principal e „sunt în magazin, fac pozele acum, completez restul acasă": o ofertă poate fi doar
 * câteva poze, fără nume/magazin/preț. {@code images} — fiecare intrare e un URL http(s) sau o poză
 * {@code data:image/...;base64,...} (aceeași convenție ca {@code Item.imageUrl}), max 8 per ofertă.
 */
public record Offer(
        String id,
        String groupId,
        String name,
        String store,
        Money unitPrice,
        BigDecimal quantity,
        String productUrl,
        List<String> images,
        String notes,
        Instant createdAt
) {

    public Offer {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(groupId, "groupId");
        Objects.requireNonNull(createdAt, "createdAt");
        images = images == null ? List.of() : List.copyOf(images);
        if (quantity != null && quantity.signum() < 0) {
            throw new IllegalArgumentException("Cantitatea nu poate fi negativă: " + quantity);
        }
    }
}
