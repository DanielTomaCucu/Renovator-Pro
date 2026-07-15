package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.InstallationType;

@Converter
public class InstallationTypeConverter extends LabelEnumConverter<InstallationType> {
    public InstallationTypeConverter() {
        super(InstallationType::label, InstallationType::fromLabel);
    }
}
