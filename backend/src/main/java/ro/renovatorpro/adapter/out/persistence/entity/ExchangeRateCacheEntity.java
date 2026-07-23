package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "exchange_rate_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateCacheEntity {

    @Id
    private String id;

    @Column(name = "base_currency", nullable = false)
    private String baseCurrency;

    @Column(name = "quote_currency", nullable = false)
    private String quoteCurrency;

    @Column(name = "rate", nullable = false)
    private BigDecimal rate;

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;

    @Column(name = "source", nullable = false)
    private String source;
}
