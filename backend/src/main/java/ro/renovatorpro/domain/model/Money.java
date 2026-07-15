package ro.renovatorpro.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value object pentru sume de bani: BigDecimal cu 2 zecimale, NON-NEGATIV prin invariant.
 * Rezultatele cu semn (ex. budgetRemaining, care poate fi negativ la depășire de buget) NU se
 * modelează ca Money — se calculează cu BigDecimal în domain.service (Faza 2).
 */
public record Money(BigDecimal amount) implements Comparable<Money> {

    public Money {
        Objects.requireNonNull(amount, "amount");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("Money nu poate fi negativ: " + amount);
        }
        amount = amount.setScale(2, RoundingMode.HALF_UP);
    }

    public static Money of(BigDecimal amount) {
        return new Money(amount);
    }

    public static Money of(long amount) {
        return new Money(BigDecimal.valueOf(amount));
    }

    public static Money zero() {
        return new Money(BigDecimal.ZERO);
    }

    public Money add(Money other) {
        return new Money(amount.add(other.amount));
    }

    /** Înmulțire cu o cantitate non-negativă (ex. preț unitar × cantitate = total element). */
    public Money multiply(BigDecimal factor) {
        return new Money(amount.multiply(factor));
    }

    @Override
    public int compareTo(Money other) {
        return amount.compareTo(other.amount);
    }
}
