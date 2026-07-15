package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.service.BudgetCalculator;
import ro.renovatorpro.domain.service.RoomDimensionsCalculator;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Agregările unui proiect calculate SERVER-SIDE (Problema 2 din audit — de-duplicare: frontend-ul le
 * consumă în loc să recalculeze aceleași reguli client-side). Toate formulele vin din {@link BudgetCalculator}
 * și {@link RoomDimensionsCalculator}, NU reinventate aici.
 */
public interface GetProjectSummaryUseCase {

    ProjectSummary execute(String currentUserId, String projectId);

    /**
     * Rezultatul agregat. Refolosește direct record-urile de domeniu ({@link BudgetCalculator.RoomCost},
     * {@link BudgetCalculator.CategoryCost}, {@link RoomDimensionsCalculator.ProjectTechnicalSummary}) —
     * mapper-ul de DTO le traduce în shape-ul JSON.
     */
    record ProjectSummary(
            Money totalEstimated,
            Money totalSpent,
            BigDecimal budgetRemaining,
            int purchaseProgress,
            long boughtCount,
            List<BudgetCalculator.RoomCost> costPerRoom,
            Map<MaterialType, BudgetCalculator.CategoryCost> costPerCategory,
            RoomDimensionsCalculator.ProjectTechnicalSummary technical
    ) {
    }
}
