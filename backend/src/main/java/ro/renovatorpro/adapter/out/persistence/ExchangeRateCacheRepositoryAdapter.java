package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.ExchangeRateCacheEntity;
import ro.renovatorpro.adapter.out.persistence.springdata.ExchangeRateCacheJpaRepository;
import ro.renovatorpro.application.port.out.ExchangeRateCacheRepository;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ExchangeRateCacheRepositoryAdapter implements ExchangeRateCacheRepository {

    private final ExchangeRateCacheJpaRepository jpaRepository;
    private final IdGenerator idGenerator;

    @Override
    public Optional<ExchangeRateSnapshot> find(String baseCurrency, String quoteCurrency) {
        return jpaRepository.findByBaseCurrencyAndQuoteCurrency(baseCurrency, quoteCurrency)
                .map(e -> new ExchangeRateSnapshot(e.getRate(), e.getFetchedAt(), e.getSource()));
    }

    @Override
    public void save(String baseCurrency, String quoteCurrency, ExchangeRateSnapshot snapshot) {
        ExchangeRateCacheEntity entity = jpaRepository.findByBaseCurrencyAndQuoteCurrency(baseCurrency, quoteCurrency)
                .orElseGet(() -> {
                    ExchangeRateCacheEntity fresh = new ExchangeRateCacheEntity();
                    fresh.setId(idGenerator.newId());
                    fresh.setBaseCurrency(baseCurrency);
                    fresh.setQuoteCurrency(quoteCurrency);
                    return fresh;
                });
        entity.setRate(snapshot.rate());
        entity.setFetchedAt(snapshot.fetchedAt());
        entity.setSource(snapshot.source());
        jpaRepository.save(entity);
    }
}
