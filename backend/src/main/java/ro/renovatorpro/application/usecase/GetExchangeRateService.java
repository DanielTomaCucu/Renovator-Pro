package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import ro.renovatorpro.application.port.in.GetExchangeRateUseCase;
import ro.renovatorpro.application.port.out.ExchangeRateCacheRepository;
import ro.renovatorpro.application.port.out.ExchangeRateFetcher;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.domain.exception.ExchangeRateFetchException;
import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GetExchangeRateService implements GetExchangeRateUseCase {

    private static final Logger log = LoggerFactory.getLogger(GetExchangeRateService.class);
    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final String BASE = "EUR";
    private static final String QUOTE = "RON";
    static final String SOURCE = "BNR";

    private final ExchangeRateCacheRepository cacheRepository;
    private final ExchangeRateFetcher fetcher;
    private final TimeProvider timeProvider;

    @Override
    public ExchangeRateSnapshot execute() {
        Optional<ExchangeRateSnapshot> cached = cacheRepository.find(BASE, QUOTE);
        boolean fresh = cached.isPresent()
                && Duration.between(cached.get().fetchedAt(), timeProvider.now()).compareTo(CACHE_TTL) < 0;
        if (fresh) {
            return cached.get();
        }

        try {
            ExchangeRateSnapshot fetched = new ExchangeRateSnapshot(fetcher.fetchEurToRonRate(), timeProvider.now(), SOURCE);
            cacheRepository.save(BASE, QUOTE, fetched);
            return fetched;
        } catch (ExchangeRateFetchException e) {
            // Sursa externă e jos — servim cache-ul vechi (dacă există) în loc să blocăm userul cu o
            // eroare; frontend-ul arată oricum `fetchedAt`, deci userul vede că nu e curs de azi.
            if (cached.isPresent()) {
                log.warn("Preluarea cursului valutar de la {} a eșuat, servesc cache-ul vechi din {}", SOURCE, cached.get().fetchedAt(), e);
                return cached.get();
            }
            throw e;
        }
    }
}
