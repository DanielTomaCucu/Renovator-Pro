package ro.renovatorpro.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.ConvertCurrencyRequest;
import ro.renovatorpro.adapter.in.web.dto.ProjectResponse;
import ro.renovatorpro.adapter.in.web.dto.ProjectUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.ProjectDtoMapper;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.in.GetProjectUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final GetProjectUseCase getProjectUseCase;
    private final UpdateProjectUseCase updateProjectUseCase;
    private final ConvertProjectCurrencyUseCase convertProjectCurrencyUseCase;
    private final ProjectDtoMapper mapper;

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable String id) {
        return mapper.toResponse(getProjectUseCase.execute(WebConstants.STUB_USER_ID, id));
    }

    @PatchMapping("/{id}")
    public ProjectResponse update(@PathVariable String id, @Valid @RequestBody ProjectUpdateRequest request) {
        UpdateProjectUseCase.Command command = mapper.toUpdateCommand(request);
        return mapper.toResponse(updateProjectUseCase.execute(WebConstants.STUB_USER_ID, id, command));
    }

    /** Conversie reală a monedei: recalculează toate sumele proiectului la cursul dat (Problema 1 din audit). */
    @PostMapping("/{id}/currency")
    public ProjectResponse convertCurrency(@PathVariable String id, @Valid @RequestBody ConvertCurrencyRequest request) {
        ConvertProjectCurrencyUseCase.Command command = mapper.toConvertCommand(request);
        return mapper.toResponse(convertProjectCurrencyUseCase.execute(WebConstants.STUB_USER_ID, id, command));
    }
}
