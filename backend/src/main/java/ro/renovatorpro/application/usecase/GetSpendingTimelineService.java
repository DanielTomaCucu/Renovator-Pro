package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetSpendingTimelineUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.service.BudgetCalculator;

import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Grupează elementele Cumpărate pe luna calendaristică a lui {@code purchasedAt} (UTC — DB-ul rulează
 * cu {@code hibernate.jdbc.time_zone: UTC}), însumează {@code itemTotal} per lună, apoi calculează suma
 * cumulativă crescătoare. Elementele fără {@code purchasedAt} (niciodată cumpărate, sau cumpărate înainte
 * de migrarea V3) sunt ignorate — nu pot fi plasate pe axa temporală.
 */
@Service
@RequiredArgsConstructor
public class GetSpendingTimelineService implements GetSpendingTimelineUseCase {

    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional(readOnly = true)
    public List<TimelinePoint> execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.VIEWER)) {
            throw new ProjectNotFoundException(projectId);
        }
        List<String> roomIds = roomRepository.findByProjectId(projectId).stream().map(Room::id).toList();
        List<Item> items = roomIds.isEmpty() ? List.of() : itemRepository.findByRoomIds(roomIds);

        // TreeMap: YearMonth e Comparable, deci iterarea de mai jos e deja cronologică ascendentă.
        Map<YearMonth, Money> perMonth = new TreeMap<>();
        for (Item item : items) {
            if (item.status() != ItemStatus.CUMPARAT || item.purchasedAt() == null) continue;
            YearMonth month = YearMonth.from(item.purchasedAt().atZone(ZoneOffset.UTC));
            perMonth.merge(month, BudgetCalculator.itemTotal(item), Money::add);
        }

        List<TimelinePoint> result = new ArrayList<>();
        Money cumulative = Money.zero();
        for (Map.Entry<YearMonth, Money> entry : perMonth.entrySet()) {
            cumulative = cumulative.add(entry.getValue());
            result.add(new TimelinePoint(entry.getKey(), cumulative));
        }
        return result;
    }
}
