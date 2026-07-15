package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.AttributeConverter;

import java.util.function.Function;

/**
 * Bază pentru convertoarele de enum-uri de domeniu care se persistă ca valoarea lor `label()`
 * (cu diacritice, identică cu enum-ul TS din frontend) — nu ca `name()` Java, nu ca ordinal.
 */
public abstract class LabelEnumConverter<E extends Enum<E>> implements AttributeConverter<E, String> {

    private final Function<E, String> toLabel;
    private final Function<String, E> fromLabel;

    protected LabelEnumConverter(Function<E, String> toLabel, Function<String, E> fromLabel) {
        this.toLabel = toLabel;
        this.fromLabel = fromLabel;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : toLabel.apply(attribute);
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        return dbData == null ? null : fromLabel.apply(dbData);
    }
}
