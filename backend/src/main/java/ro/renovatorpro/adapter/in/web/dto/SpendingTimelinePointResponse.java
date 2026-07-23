package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;

/**
 * Un punct din seria „Evoluția Cheltuielilor" (Problema 3 din audit) — DOUĂ serii: {@code cumulativeSpent}
 * (cumpărat, linia principală) și {@code cumulativeTotal} (toate elementele, linia secundară). {@code month}
 * e format ISO "yyyy-MM" — formatarea etichetei (nume de lună RO, an dacă diferă de anul curent) e concern
 * de prezentare, derivat pe frontend (nu aici).
 */
public record SpendingTimelinePointResponse(String month, BigDecimal cumulativeSpent, BigDecimal cumulativeTotal) {
}
