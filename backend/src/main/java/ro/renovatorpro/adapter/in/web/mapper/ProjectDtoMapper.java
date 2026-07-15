package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.ProjectResponse;
import ro.renovatorpro.adapter.in.web.dto.ProjectUpdateRequest;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.domain.model.Project;

@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface ProjectDtoMapper {

    ProjectResponse toResponse(Project project);

    UpdateProjectUseCase.Command toUpdateCommand(ProjectUpdateRequest request);
}
