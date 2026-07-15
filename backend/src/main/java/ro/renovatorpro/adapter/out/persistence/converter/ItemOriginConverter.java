package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.ItemOrigin;

@Converter
public class ItemOriginConverter extends LabelEnumConverter<ItemOrigin> {
    public ItemOriginConverter() {
        super(ItemOrigin::label, ItemOrigin::fromLabel);
    }
}
