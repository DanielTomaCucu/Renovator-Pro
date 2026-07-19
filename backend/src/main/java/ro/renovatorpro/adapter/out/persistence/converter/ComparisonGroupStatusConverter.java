package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;

@Converter
public class ComparisonGroupStatusConverter extends LabelEnumConverter<ComparisonGroupStatus> {
    public ComparisonGroupStatusConverter() {
        super(ComparisonGroupStatus::label, ComparisonGroupStatus::fromLabel);
    }
}
