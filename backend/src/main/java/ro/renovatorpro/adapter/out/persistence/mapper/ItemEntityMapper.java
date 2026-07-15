package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.out.persistence.entity.ItemEntity;
import ro.renovatorpro.domain.model.Item;

@Mapper(componentModel = "spring")
public interface ItemEntityMapper {

    Item toDomain(ItemEntity entity);

    ItemEntity toEntity(Item item);
}
