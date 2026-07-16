package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetProjectSummaryUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.service.BudgetCalculator;
import ro.renovatorpro.domain.service.RoomDimensionsCalculator;

import java.util.List;

/**
 * Compune agregările proiectului dintr-o singură citire (project + rooms + items), delegând fiecare
 * calcul la {@link BudgetCalculator} / {@link RoomDimensionsCalculator}. Sursa unică de adevăr pentru
 * totalurile pe care frontend-ul le afișa recalculând local (Problema 2 din audit).
 */
@Service
@RequiredArgsConstructor
public class GetProjectSummaryService implements GetProjectSummaryUseCase {

    private final ProjectRepository projectRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional(readOnly = true)
    public ProjectSummary execute(String currentUserId, String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        List<Room> rooms = roomRepository.findByProjectId(projectId);
        List<Item> items = rooms.isEmpty()
                ? List.of()
                : itemRepository.findByRoomIds(rooms.stream().map(Room::id).toList());

        return new ProjectSummary(
                BudgetCalculator.totalEstimated(items),
                BudgetCalculator.totalSpent(items),
                BudgetCalculator.budgetRemaining(project.totalBudget(), items),
                BudgetCalculator.purchaseProgress(items),
                BudgetCalculator.boughtCount(items),
                BudgetCalculator.costPerRoom(rooms, items),
                BudgetCalculator.costPerCategory(items),
                RoomDimensionsCalculator.projectTechnicalSummary(rooms)
        );
    }
}
