package ro.renovatorpro.domain.model;

import java.math.BigDecimal;
import java.util.Objects;

/** Un element de cumpărat, aparținând unei camere (FK roomId). `quantity` poate fi fracționar (ex. mp). */
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
        ItemOrigin origin
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
        if (quantity.signum() < 0) {
            throw new IllegalArgumentException("Cantitatea nu poate fi negativă: " + quantity);
        }
    }
}
