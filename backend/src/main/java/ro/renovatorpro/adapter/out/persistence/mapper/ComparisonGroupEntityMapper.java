package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.out.persistence.entity.ComparisonGroupEntity;
import ro.renovatorpro.domain.model.ComparisonGroup;

@Mapper(componentModel = "spring")
public interface ComparisonGroupEntityMapper {

    ComparisonGroup toDomain(ComparisonGroupEntity entity);

    ComparisonGroupEntity toEntity(ComparisonGroup group);
}
