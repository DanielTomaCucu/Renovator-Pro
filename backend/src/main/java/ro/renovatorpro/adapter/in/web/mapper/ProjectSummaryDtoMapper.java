package ro.renovatorpro.adapter.in.web.mapper;

import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.in.web.dto.ProjectSummaryResponse;
import ro.renovatorpro.application.port.in.GetProjectSummaryUseCase.ProjectSummary;
import ro.renovatorpro.domain.service.BudgetCalculator;
import ro.renovatorpro.domain.service.RoomDimensionsCalculator;

import java.util.List;
import java.util.Map;

/**
 * Traducere {@link ProjectSummary} (tipuri de domeniu) → {@link ProjectSummaryResponse} (JSON). Scris de
 * mână (nu MapStruct) fiindcă {@code costPerCategory} e un {@code Map<MaterialType, CategoryCost>} ce
 * trebuie desfășurat în listă cu label-ul enum-ului — mai clar explicit decât cu adnotări.
 */
@Component
public class ProjectSummaryDtoMapper {

    public ProjectSummaryResponse toResponse(ProjectSummary summary) {
        return new ProjectSummaryResponse(
                summary.totalEstimated().amount(),
                summary.totalSpent().amount(),
                summary.budgetRemaining(),
                summary.purchaseProgress(),
                summary.boughtCount(),
                toRoomCosts(summary.costPerRoom()),
                toCategoryCosts(summary.costPerCategory()),
                toTechnical(summary.technical())
        );
    }

    private List<ProjectSummaryResponse.RoomCostDto> toRoomCosts(List<BudgetCalculator.RoomCost> costs) {
        return costs.stream()
                .map(rc -> new ProjectSummaryResponse.RoomCostDto(rc.name(), rc.total().amount()))
                .toList();
    }

    private List<ProjectSummaryResponse.CategoryCostDto> toCategoryCosts(
            Map<ro.renovatorpro.domain.model.MaterialType, BudgetCalculator.CategoryCost> costs) {
        return costs.entrySet().stream()
                .map(e -> new ProjectSummaryResponse.CategoryCostDto(
                        e.getKey().label(),
                        e.getValue().total().amount(),
                        e.getValue().spent().amount()))
                .toList();
    }

    private ProjectSummaryResponse.TechnicalSummaryDto toTechnical(
            RoomDimensionsCalculator.ProjectTechnicalSummary technical) {
        return new ProjectSummaryResponse.TechnicalSummaryDto(
                technical.totalFloorArea(), technical.configuredRoomsRatio());
    }
}
