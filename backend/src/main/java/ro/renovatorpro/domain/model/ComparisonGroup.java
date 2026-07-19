package ro.renovatorpro.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Un produs de decis pentru o cameră (ex. „Gresie baie"), cu N oferte comparate (vezi {@link Offer},
 * repository separat — mirroarea split Room/Item). {@code chosenOfferId}/{@code createdItemId} sunt
 * setate DOAR de {@code ChooseOfferService}, la alegerea unei oferte; rămân {@code null} cât timp
 * grupul e {@link ComparisonGroupStatus#IN_ANALIZA}.
 */
public record ComparisonGroup(
        String id,
        String roomId,
        String name,
        MaterialType materialType,
        ComparisonGroupStatus status,
        String chosenOfferId,
        String createdItemId,
        Instant createdAt
) {

    public ComparisonGroup {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(roomId, "roomId");
        Objects.requireNonNull(name, "name");
        Objects.requireNonNull(materialType, "materialType");
        Objects.requireNonNull(status, "status");
        Objects.requireNonNull(createdAt, "createdAt");
    }
}
