package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.RoomType;

@Converter
public class RoomTypeConverter extends LabelEnumConverter<RoomType> {
    public RoomTypeConverter() {
        super(RoomType::label, RoomType::fromLabel);
    }
}
