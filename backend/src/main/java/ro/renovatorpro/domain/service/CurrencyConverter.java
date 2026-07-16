package ro.renovatorpro.domain.service;

import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Conversie pură a unei sume între monede, la un curs dat. Sursa unică de adevăr pentru regula de
 * conversie EUR↔RON (Problema 1 din audit) — frontend-ul o consumă prin endpoint, nu o reimplementează.
 *
 * <p>Convenția cursului ({@code rate}): câți RON per 1 EUR (ex. {@code 4.97}). Deci:
 * <ul>
 *   <li>EUR → RON: {@code sumă × rate}</li>
 *   <li>RON → EUR: {@code sumă ÷ rate}</li>
 *   <li>aceeași monedă: identitate (nicio pierdere de precizie)</li>
 * </ul>
 * Rezultatul e rotunjit la 2 zecimale HALF_UP (invariantul {@link Money}).
 */
public final class CurrencyConverter {

    private CurrencyConverter() {
    }

    /**
     * Convertește {@code amount} din moneda {@code from} în {@code to} la cursul {@code rate}
     * (RON per 1 EUR, strict pozitiv).
     */
    public static Money convert(Money amount, Currency from, Currency to, BigDecimal rate) {
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(from, "from");
        Objects.requireNonNull(to, "to");
        Objects.requireNonNull(rate, "rate");
        if (rate.signum() <= 0) {
            throw new IllegalArgumentException("Cursul valutar trebuie să fie strict pozitiv: " + rate);
        }
        if (from == to) {
            return amount;
        }
        // Doar două monede azi; ramificăm explicit pe direcție (mai clar decât un factor generic).
        if (from == Currency.EUR && to == Currency.RON) {
            return Money.of(amount.amount().multiply(rate));
        }
        if (from == Currency.RON && to == Currency.EUR) {
            // Împărțire cu scală explicită — 1/rate nu e finit; Money re-rotunjește la 2 zecimale HALF_UP.
            return Money.of(amount.amount().divide(rate, 2, RoundingMode.HALF_UP));
        }
        throw new IllegalArgumentException("Conversie nesuportată: " + from + " → " + to);
    }
}
