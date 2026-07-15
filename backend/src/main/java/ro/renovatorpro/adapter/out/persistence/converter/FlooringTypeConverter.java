package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.FlooringType;

@Converter
public class FlooringTypeConverter extends LabelEnumConverter<FlooringType> {
    public FlooringTypeConverter() {
        super(FlooringType::label, FlooringType::fromLabel);
    }
}
