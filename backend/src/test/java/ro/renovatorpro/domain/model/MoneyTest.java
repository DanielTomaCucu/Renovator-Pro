package ro.renovatorpro.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MoneyTest {

    @Test
    void refuzaSumaNegativa() {
        assertThatThrownBy(() -> Money.of(new BigDecimal("-0.01")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void normalizeazaLaDouaZecimale() {
        assertThat(Money.of(new BigDecimal("10.1")).amount()).isEqualByComparingTo("10.10");
        assertThat(Money.of(new BigDecimal("10.005")).amount()).isEqualByComparingTo("10.01");
    }

    @Test
    void adunaCorect() {
        assertThat(Money.of(10).add(Money.of(5)).amount()).isEqualByComparingTo("15.00");
    }

    @Test
    void inmultesteCuCantitate() {
        assertThat(Money.of(new BigDecimal("12.50")).multiply(new BigDecimal("3")).amount())
                .isEqualByComparingTo("37.50");
    }

    @Test
    void zeroEsteNeutru() {
        assertThat(Money.zero().amount()).isEqualByComparingTo("0.00");
    }
}
