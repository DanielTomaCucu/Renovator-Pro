package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Agregările proiectului expuse frontend-ului (Problema 2 din audit). Enum-urile sunt String (label cu
 * diacritice), sumele sunt {@code number} în JSON. Oglinda TS: {@code src/shared/types/ProjectSummary.ts}.
 */
public record ProjectSummaryResponse(
        BigDecimal totalEstimated,
        BigDecimal totalSpent,
        BigDecimal budgetRemaining,
        int purchaseProgress,
        long boughtCount,
        List<RoomCostDto> costPerRoom,
        List<CategoryCostDto> costPerCategory,
        TechnicalSummaryDto technical
) {

    /** O intrare din distribuția cost-per-cameră (donut chart /analiza). */
    public record RoomCostDto(String name, BigDecimal total) {
    }

    /** Agregare {total, spent} per categorie de material (progress bars /analiza). */
    public record CategoryCostDto(String materialType, BigDecimal total, BigDecimal spent) {
    }

    /** Sumar tehnic agregat (card „Sumar Tehnic Global" din /configurare). */
    public record TechnicalSummaryDto(double totalFloorArea, double configuredRoomsRatio) {
    }
}
