package ro.renovatorpro.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

/** Un curs valutar cunoscut la un moment dat, cu proveniența lui — folosit pt. cache-ul EUR/RON. */
public record ExchangeRateSnapshot(BigDecimal rate, Instant fetchedAt, String source) {
}
