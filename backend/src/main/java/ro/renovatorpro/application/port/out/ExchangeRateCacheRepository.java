package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

import java.util.Optional;

/** Cache singur-rând per pereche de monede — vezi {@code V12__exchange_rate_cache.sql}. */
public interface ExchangeRateCacheRepository {

    Optional<ExchangeRateSnapshot> find(String baseCurrency, String quoteCurrency);

    void save(String baseCurrency, String quoteCurrency, ExchangeRateSnapshot snapshot);
}
