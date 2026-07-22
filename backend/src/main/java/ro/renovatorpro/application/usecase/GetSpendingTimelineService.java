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
import java.util.TreeSet;

/**
 * Grupează elementele pe luna calendaristică (UTC — DB-ul rulează cu {@code hibernate.jdbc.time_zone: UTC})
 * a lui {@code purchasedAt} (serie „cheltuit", doar {@code ItemStatus.CUMPARAT}) ȘI separat a lui
 * {@code createdAt} (serie „total", toate elementele), apoi calculează sumele cumulative crescătoare pe
 * fiecare serie, aliniate pe reuniunea lunilor din ambele. {@code purchasedAt >= createdAt} întotdeauna
 * (nu poți cumpăra un element înainte să existe) — de-asta {@code cumulativeTotal >= cumulativeSpent} în
 * fiecare punct, garantat structural, nu doar din date „curate".
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

        Map<YearMonth, Money> spentPerMonth = new TreeMap<>();
        Map<YearMonth, Money> totalPerMonth = new TreeMap<>();
        for (Item item : items) {
            YearMonth createdMonth = YearMonth.from(item.createdAt().atZone(ZoneOffset.UTC));
            totalPerMonth.merge(createdMonth, BudgetCalculator.itemTotal(item), Money::add);
            if (item.status() == ItemStatus.CUMPARAT && item.purchasedAt() != null) {
                YearMonth spentMonth = YearMonth.from(item.purchasedAt().atZone(ZoneOffset.UTC));
                spentPerMonth.merge(spentMonth, BudgetCalculator.itemTotal(item), Money::add);
            }
        }

        // Reuniunea lunilor din ambele serii, cronologic (TreeSet) — o lună poate avea activitate DOAR
        // pe una din serii (ex. o lună cu cumpărături dar fără elemente noi adăugate).
        TreeSet<YearMonth> months = new TreeSet<>();
        months.addAll(spentPerMonth.keySet());
        months.addAll(totalPerMonth.keySet());

        List<TimelinePoint> result = new ArrayList<>();
        Money cumulativeSpent = Money.zero();
        Money cumulativeTotal = Money.zero();
        for (YearMonth month : months) {
            cumulativeSpent = cumulativeSpent.add(spentPerMonth.getOrDefault(month, Money.zero()));
            cumulativeTotal = cumulativeTotal.add(totalPerMonth.getOrDefault(month, Money.zero()));
            result.add(new TimelinePoint(month, cumulativeSpent, cumulativeTotal));
        }
        return result;
    }
}
