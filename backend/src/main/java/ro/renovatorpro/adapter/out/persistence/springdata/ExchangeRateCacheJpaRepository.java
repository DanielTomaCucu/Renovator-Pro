package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.ExchangeRateCacheEntity;

import java.util.Optional;

public interface ExchangeRateCacheJpaRepository extends JpaRepository<ExchangeRateCacheEntity, String> {

    Optional<ExchangeRateCacheEntity> findByBaseCurrencyAndQuoteCurrency(String baseCurrency, String quoteCurrency);
}
