package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ExchangeRateResponse(BigDecimal rate, Instant fetchedAt, String source) {
}
