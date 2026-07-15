package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.RoomShape;

@Converter
public class RoomShapeConverter extends LabelEnumConverter<RoomShape> {
    public RoomShapeConverter() {
        super(RoomShape::label, RoomShape::fromLabel);
    }
}
