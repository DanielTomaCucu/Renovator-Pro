package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Body pt. {@code POST /api/projects/{id}/currency} — oglinda contractului din api-contract.md.
 * {@code exchangeRate} = câți RON per 1 EUR (strict pozitiv). {@code targetCurrency} e String (label
 * cu diacritice) ca toate enum-urile în DTO-uri; se traduce în domeniu în mapper.
 */
public record ConvertCurrencyRequest(
        @NotNull(message = "Moneda țintă este obligatorie") String targetCurrency,
        @NotNull(message = "Cursul valutar este obligatoriu")
        @Positive(message = "Cursul valutar trebuie să fie strict pozitiv") BigDecimal exchangeRate
) {
}
