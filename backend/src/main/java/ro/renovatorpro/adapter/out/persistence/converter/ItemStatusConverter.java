package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.ItemStatus;

@Converter
public class ItemStatusConverter extends LabelEnumConverter<ItemStatus> {
    public ItemStatusConverter() {
        super(ItemStatus::label, ItemStatus::fromLabel);
    }
}
