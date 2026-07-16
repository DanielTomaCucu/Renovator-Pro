package ro.renovatorpro.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Un element de cumpărat, aparținând unei camere (FK roomId). `quantity` poate fi fracționar (ex. mp).
 *
 * <p>{@code createdAt} — momentul adăugării, imutabil, setat o singură dată la creare.
 * {@code purchasedAt} — momentul ultimei tranziții spre {@link ItemStatus#CUMPARAT} (null dacă elementul
 * nu a fost niciodată cumpărat); folosit de graficul „Evoluția Cheltuielilor" (Problema 3 din audit) —
 * NU se resetează dacă statusul revine la altceva, dar se actualizează la o nouă tranziție spre Cumpărat.
 */
public record Item(
        String id,
        String roomId,
        String name,
        MaterialType materialType,
        String source,
        ItemStatus status,
        BigDecimal quantity,
        Money unitPrice,
        String productUrl,
        String imageUrl,
        ItemOrigin origin,
        Instant createdAt,
        Instant purchasedAt
) {

    public Item {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(roomId, "roomId");
        Objects.requireNonNull(name, "name");
        Objects.requireNonNull(materialType, "materialType");
        Objects.requireNonNull(status, "status");
        Objects.requireNonNull(quantity, "quantity");
        Objects.requireNonNull(unitPrice, "unitPrice");
        Objects.requireNonNull(origin, "origin");
        Objects.requireNonNull(createdAt, "createdAt");
        if (quantity.signum() < 0) {
            throw new IllegalArgumentException("Cantitatea nu poate fi negativă: " + quantity);
        }
    }
}
