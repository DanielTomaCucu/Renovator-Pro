package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.ConvertCurrencyRequest;
import ro.renovatorpro.adapter.in.web.dto.ProjectResponse;
import ro.renovatorpro.adapter.in.web.dto.ProjectUpdateRequest;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.domain.model.Project;

@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface ProjectDtoMapper {

    ProjectResponse toResponse(Project project);

    UpdateProjectUseCase.Command toUpdateCommand(ProjectUpdateRequest request);

    /** {@code targetCurrency} (String label) → {@code Currency} via {@link DtoConversionSupport#toCurrency}. */
    ConvertProjectCurrencyUseCase.Command toConvertCommand(ConvertCurrencyRequest request);
}
