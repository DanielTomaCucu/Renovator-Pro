package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.Currency;

@Converter
public class CurrencyConverter extends LabelEnumConverter<Currency> {
    public CurrencyConverter() {
        super(Currency::label, Currency::fromLabel);
    }
}
