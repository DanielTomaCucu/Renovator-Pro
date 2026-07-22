package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.out.persistence.entity.InspirationImageEntity;
import ro.renovatorpro.domain.model.InspirationImage;

@Mapper(componentModel = "spring")
public interface InspirationImageEntityMapper {

    InspirationImage toDomain(InspirationImageEntity entity);

    InspirationImageEntity toEntity(InspirationImage image);
}
