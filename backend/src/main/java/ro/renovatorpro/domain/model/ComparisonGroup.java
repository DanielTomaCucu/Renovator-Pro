package ro.renovatorpro.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Un produs de decis pentru o cameră (ex. „Gresie baie"), cu N oferte comparate (vezi {@link Offer},
 * repository separat — mirroarea split Room/Item). {@code chosenOfferId}/{@code createdItemId} sunt
 * setate DOAR de {@code ChooseOfferService}, la alegerea unei oferte; rămân {@code null} cât timp
 * grupul e {@link ComparisonGroupStatus#IN_ANALIZA}.
 *
 * <p>{@code linkedItemId} — elementul {@code Item} cu {@code origin Din Configurare} pe care „choose" îl
 * va ACTUALIZA (în loc să creeze un item nou), rezolvat de {@code AutoItemReconciler#resolveLinkedItem}
 * la creare/mutare de cameră/schimbare de categorie (docs/cerinte-comparator-config-sync.md). {@code null}
 * dacă nu există niciun element din configurare pentru combinația cameră+material (ex. Mobilă,
 * Electrocasnice) — pe acea ramură „choose" creează un item nou, ca înainte. Re-validat la fiecare
 * „choose" (poate deveni stale dacă itemul e șters/recreat de reconciliere).
 */
public record ComparisonGroup(
        String id,
        String roomId,
        String name,
        MaterialType materialType,
        ComparisonGroupStatus status,
        String chosenOfferId,
        String createdItemId,
        String linkedItemId,
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
