package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.MaterialType;

@Converter
public class MaterialTypeConverter extends LabelEnumConverter<MaterialType> {
    public MaterialTypeConverter() {
        super(MaterialType::label, MaterialType::fromLabel);
    }
}
