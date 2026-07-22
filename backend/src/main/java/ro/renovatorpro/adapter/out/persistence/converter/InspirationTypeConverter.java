package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.InspirationType;

@Converter
public class InspirationTypeConverter extends LabelEnumConverter<InspirationType> {
    public InspirationTypeConverter() {
        super(InspirationType::label, InspirationType::fromLabel);
    }
}
