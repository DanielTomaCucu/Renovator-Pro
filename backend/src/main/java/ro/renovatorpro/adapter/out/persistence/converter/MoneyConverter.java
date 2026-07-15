package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;

/** Persistă {@link Money} ca NUMERIC — nicio zonă a bazei de date nu vede tipul Money, doar suma. */
@Converter
public class MoneyConverter implements AttributeConverter<Money, BigDecimal> {

    @Override
    public BigDecimal convertToDatabaseColumn(Money attribute) {
        return attribute == null ? null : attribute.amount();
    }

    @Override
    public Money convertToEntityAttribute(BigDecimal dbData) {
        return dbData == null ? null : Money.of(dbData);
    }
}
