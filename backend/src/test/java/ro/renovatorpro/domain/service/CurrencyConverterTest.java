package ro.renovatorpro.domain.service;

import org.junit.jupiter.api.Test;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Regula pură de conversie EUR↔RON (Problema 1 din audit): factor, direcție, rotunjire, cazuri-limită. */
class CurrencyConverterTest {

    private static final BigDecimal RATE = new BigDecimal("4.97"); // 1 EUR = 4.97 RON

    @Test
    void eurToRonInmultesteCuCursul() {
        Money result = CurrencyConverter.convert(Money.of(100), Currency.EUR, Currency.RON, RATE);
        assertThat(result.amount()).isEqualByComparingTo("497.00"); // 100 × 4.97
    }

    @Test
    void ronToEurImparteLaCurs() {
        Money result = CurrencyConverter.convert(Money.of(497), Currency.RON, Currency.EUR, RATE);
        assertThat(result.amount()).isEqualByComparingTo("100.00"); // 497 ÷ 4.97
    }

    @Test
    void rotunjesteHalfUpLaDouaZecimale() {
        // 10 ÷ 4.97 = 2.0120724... → 2.01
        Money result = CurrencyConverter.convert(Money.of(10), Currency.RON, Currency.EUR, RATE);
        assertThat(result.amount()).isEqualByComparingTo("2.01");
    }

    @Test
    void aceeasiMonedaEsteIdentitate() {
        Money amount = Money.of(new BigDecimal("123.45"));
        assertThat(CurrencyConverter.convert(amount, Currency.EUR, Currency.EUR, RATE)).isEqualTo(amount);
        assertThat(CurrencyConverter.convert(amount, Currency.RON, Currency.RON, RATE)).isEqualTo(amount);
    }

    @Test
    void cursNepozitivEsteRespins() {
        assertThatThrownBy(() -> CurrencyConverter.convert(Money.of(100), Currency.EUR, Currency.RON, BigDecimal.ZERO))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> CurrencyConverter.convert(Money.of(100), Currency.EUR, Currency.RON, new BigDecimal("-1")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void dusIntorsPierdePrecizie() {
        // Caveat documentat: conversia e distructivă. 3 EUR → RON → EUR nu revine exact la 3.00 pt. orice curs.
        Money ron = CurrencyConverter.convert(Money.of(new BigDecimal("3.33")), Currency.EUR, Currency.RON, new BigDecimal("4.99"));
        Money backToEur = CurrencyConverter.convert(ron, Currency.RON, Currency.EUR, new BigDecimal("4.99"));
        assertThat(backToEur.amount()).isEqualByComparingTo("3.33"); // aici revine, dar nu e garantat în general
    }
}
