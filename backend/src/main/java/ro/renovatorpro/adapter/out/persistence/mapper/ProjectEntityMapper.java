package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectEntity;
import ro.renovatorpro.domain.model.Project;

@Mapper(componentModel = "spring")
public interface ProjectEntityMapper {

    Project toDomain(ProjectEntity entity);

    @Mapping(target = "ownerId", source = "ownerId")
    @Mapping(target = "inviteCode", ignore = true)
    ProjectEntity toEntity(Project project, String ownerId);
}
