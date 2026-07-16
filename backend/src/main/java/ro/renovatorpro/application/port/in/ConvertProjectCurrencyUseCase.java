package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Project;

import java.math.BigDecimal;

/**
 * Conversie reală a monedei unui proiect: recalculează toate sumele (buget proiect, buget alocat pe
 * camere, preț unitar pe elemente) la cursul dat și setează moneda țintă (Problema 1 din audit).
 */
public interface ConvertProjectCurrencyUseCase {

    Project execute(String currentUserId, String projectId, Command command);

    /** {@code exchangeRate} = câți RON per 1 EUR (strict pozitiv). Oglindă a body-ului endpoint-ului. */
    record Command(Currency targetCurrency, BigDecimal exchangeRate) {
    }
}
