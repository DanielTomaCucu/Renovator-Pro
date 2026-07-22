package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Money;

import java.time.YearMonth;
import java.util.List;

/**
 * Serie temporală DUBLĂ, pe luni, pentru graficul „Evoluția Cheltuielilor": {@code cumulativeSpent}
 * (linia principală — doar elemente {@code ItemStatus.CUMPARAT}, pe luna {@code purchasedAt}) și
 * {@code cumulativeTotal} (linia secundară, mai puțin vizibilă — TOATE elementele indiferent de status,
 * pe luna {@code createdAt}) — ca userul să compare vizual „cât am cheltuit până acum" față de „cât e
 * planificat în total". Ambele serii sunt unificate pe aceeași axă de luni (reuniunea lunilor din ambele
 * seturi de date), cumulate crescător — dacă o lună n-are activitate proprie pe o serie, valoarea ei
 * rămâne cea de la ultima lună cu activitate (step function, nu gol).
 */
public interface GetSpendingTimelineUseCase {

    /**
     * Sortată cronologic ascendent. Listă goală DOAR dacă proiectul nu are NICIUN element încă (nu doar
     * „nimic cumpărat" — {@code cumulativeTotal} are nevoie de elementele neachiziționate ca să crească).
     */
    List<TimelinePoint> execute(String currentUserId, String projectId);

    /** {@code cumulativeSpent}/{@code cumulativeTotal} = suma tuturor lunilor până la și inclusiv aceasta, pe seria respectivă. */
    record TimelinePoint(YearMonth month, Money cumulativeSpent, Money cumulativeTotal) {
    }
}
