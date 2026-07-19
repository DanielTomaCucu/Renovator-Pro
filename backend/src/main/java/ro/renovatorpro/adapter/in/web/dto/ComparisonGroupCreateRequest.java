package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

/** Oglindă a {@code Omit<ComparisonGroup, "id" | "roomId" | "status" | ...>} — creare grup nou, gol de oferte. */
public record ComparisonGroupCreateRequest(
        @NotBlank(message = "Numele grupului este obligatoriu") String name,
        @NotBlank(message = "Tipul de material este obligatoriu") String materialType
) {
}
