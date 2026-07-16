package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Money;

import java.time.YearMonth;
import java.util.List;

/**
 * Serie temporală de cheltuieli cumulate, pe luni, pentru graficul „Evoluția Cheltuielilor" (Problema 3
 * din audit). Bazată pe {@code Item.purchasedAt} (momentul cumpărării, nu al adăugării — decizie din
 * audit: „recomandat: după momentul cumpărării"), doar elemente {@code ItemStatus.CUMPARAT}.
 */
public interface GetSpendingTimelineUseCase {

    /** Sortată cronologic ascendent. Listă goală dacă niciun element nu are `purchasedAt` (nimic cumpărat încă). */
    List<TimelinePoint> execute(String currentUserId, String projectId);

    /** {@code cumulativeSpent} = suma tuturor lunilor până la și inclusiv aceasta. */
    record TimelinePoint(YearMonth month, Money cumulativeSpent) {
    }
}
