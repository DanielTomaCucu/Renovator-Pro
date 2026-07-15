package ro.renovatorpro.adapter.out.persistence.converter;

import jakarta.persistence.Converter;
import ro.renovatorpro.domain.model.TileSize;

@Converter
public class TileSizeConverter extends LabelEnumConverter<TileSize> {
    public TileSizeConverter() {
        super(TileSize::label, TileSize::fromLabel);
    }
}
