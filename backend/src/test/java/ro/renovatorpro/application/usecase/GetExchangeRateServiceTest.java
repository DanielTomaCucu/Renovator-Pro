package ro.renovatorpro.application.usecase;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ro.renovatorpro.application.port.out.ExchangeRateCacheRepository;
import ro.renovatorpro.application.port.out.ExchangeRateFetcher;
import ro.renovatorpro.domain.exception.ExchangeRateFetchException;
import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GetExchangeRateServiceTest {

    private final FakeTimeProvider timeProvider = new FakeTimeProvider();
    private FakeExchangeRateFetcher fetcher;
    private FakeExchangeRateCacheRepository cacheRepository;
    private GetExchangeRateService service;

    @BeforeEach
    void setUp() {
        fetcher = new FakeExchangeRateFetcher();
        cacheRepository = new FakeExchangeRateCacheRepository();
        service = new GetExchangeRateService(cacheRepository, fetcher, timeProvider);
    }

    @Test
    void fara_cache_apeleaza_sursa_externa_si_salveaza_rezultatul() {
        fetcher.rate = new BigDecimal("4.9750");

        ExchangeRateSnapshot result = service.execute();

        assertThat(result.rate()).isEqualByComparingTo("4.9750");
        assertThat(result.source()).isEqualTo("BNR");
        assertThat(result.fetchedAt()).isEqualTo(timeProvider.now());
        assertThat(fetcher.callCount).isEqualTo(1);
        assertThat(cacheRepository.find("EUR", "RON")).isPresent();
    }

    @Test
    void cu_cache_recent_sub_24h_nu_reapeleaza_sursa_externa() {
        Instant fetchedAt = Instant.parse("2026-01-01T08:00:00Z");
        cacheRepository.save("EUR", "RON", new ExchangeRateSnapshot(new BigDecimal("5.00"), fetchedAt, "BNR"));
        timeProvider.set(fetchedAt.plus(Duration.ofHours(23)));

        ExchangeRateSnapshot result = service.execute();

        assertThat(result.rate()).isEqualByComparingTo("5.00");
        assertThat(fetcher.callCount).isZero();
    }

    @Test
    void cu_cache_mai_vechi_de_24h_reapeleaza_si_reimprospateaza() {
        Instant fetchedAt = Instant.parse("2026-01-01T08:00:00Z");
        cacheRepository.save("EUR", "RON", new ExchangeRateSnapshot(new BigDecimal("5.00"), fetchedAt, "BNR"));
        timeProvider.set(fetchedAt.plus(Duration.ofHours(24).plusMinutes(1)));
        fetcher.rate = new BigDecimal("5.01");

        ExchangeRateSnapshot result = service.execute();

        assertThat(result.rate()).isEqualByComparingTo("5.01");
        assertThat(fetcher.callCount).isEqualTo(1);
        assertThat(cacheRepository.find("EUR", "RON").get().rate()).isEqualByComparingTo("5.01");
    }

    @Test
    void sursa_externa_pica_dar_exista_cache_vechi_serveste_cache_ul() {
        Instant fetchedAt = Instant.parse("2026-01-01T08:00:00Z");
        cacheRepository.save("EUR", "RON", new ExchangeRateSnapshot(new BigDecimal("4.90"), fetchedAt, "BNR"));
        timeProvider.set(fetchedAt.plus(Duration.ofHours(48)));
        fetcher.shouldFail = true;

        ExchangeRateSnapshot result = service.execute();

        assertThat(result.rate()).isEqualByComparingTo("4.90");
        assertThat(result.fetchedAt()).isEqualTo(fetchedAt);
    }

    @Test
    void sursa_externa_pica_fara_niciun_cache_arunca_exceptia() {
        fetcher.shouldFail = true;

        assertThatThrownBy(() -> service.execute()).isInstanceOf(ExchangeRateFetchException.class);
    }

    private static class FakeExchangeRateFetcher implements ExchangeRateFetcher {
        BigDecimal rate = BigDecimal.ONE;
        boolean shouldFail = false;
        int callCount = 0;

        @Override
        public BigDecimal fetchEurToRonRate() {
            callCount++;
            if (shouldFail) throw new ExchangeRateFetchException("simulat", null);
            return rate;
        }
    }

    private static class FakeExchangeRateCacheRepository implements ExchangeRateCacheRepository {
        private final Map<String, ExchangeRateSnapshot> store = new HashMap<>();

        @Override
        public Optional<ExchangeRateSnapshot> find(String baseCurrency, String quoteCurrency) {
            return Optional.ofNullable(store.get(key(baseCurrency, quoteCurrency)));
        }

        @Override
        public void save(String baseCurrency, String quoteCurrency, ExchangeRateSnapshot snapshot) {
            store.put(key(baseCurrency, quoteCurrency), snapshot);
        }

        private static String key(String base, String quote) {
            return base + "/" + quote;
        }
    }
}
