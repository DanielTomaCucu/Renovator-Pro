package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Oglindă a {@code Omit<ComparisonGroup, "id" | "roomId" | "status" | ...>} — creare grup nou, gol de oferte.
 * {@code linkedItemId} opțional: alegerea explicită a userului la ambiguitate (≥2 elemente „Din
 * Configurare" cu același material în cameră) — vezi docs/cerinte-comparator-config-sync.md.
 */
public record ComparisonGroupCreateRequest(
        @NotBlank(message = "Numele grupului este obligatoriu") String name,
        @NotBlank(message = "Tipul de material este obligatoriu") String materialType,
        String linkedItemId
) {
}
