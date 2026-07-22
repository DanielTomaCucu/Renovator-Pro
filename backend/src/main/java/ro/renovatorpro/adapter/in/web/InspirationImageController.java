package ro.renovatorpro.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageResponse;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.InspirationImageDtoMapper;
import ro.renovatorpro.application.port.in.AddInspirationImageUseCase;
import ro.renovatorpro.application.port.in.DeleteInspirationImageUseCase;
import ro.renovatorpro.application.port.in.GetInspirationImagesUseCase;
import ro.renovatorpro.application.port.in.UpdateInspirationImageUseCase;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InspirationImageController {

    private final GetInspirationImagesUseCase getInspirationImagesUseCase;
    private final AddInspirationImageUseCase addInspirationImageUseCase;
    private final UpdateInspirationImageUseCase updateInspirationImageUseCase;
    private final DeleteInspirationImageUseCase deleteInspirationImageUseCase;
    private final InspirationImageDtoMapper mapper;

    @GetMapping("/api/projects/{projectId}/inspiration-images")
    public List<InspirationImageResponse> list(@PathVariable String projectId) {
        return getInspirationImagesUseCase.execute(CurrentUser.id(), projectId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @PostMapping("/api/projects/{projectId}/inspiration-images")
    @ResponseStatus(HttpStatus.CREATED)
    public InspirationImageResponse create(@PathVariable String projectId, @Valid @RequestBody InspirationImageCreateRequest request) {
        AddInspirationImageUseCase.Command command = mapper.toAddCommand(request);
        return mapper.toResponse(addInspirationImageUseCase.execute(CurrentUser.id(), projectId, command));
    }

    @PatchMapping("/api/inspiration-images/{id}")
    public InspirationImageResponse update(@PathVariable String id, @RequestBody InspirationImageUpdateRequest request) {
        UpdateInspirationImageUseCase.Command command = mapper.toUpdateCommand(request);
        return mapper.toResponse(updateInspirationImageUseCase.execute(CurrentUser.id(), id, command));
    }

    @DeleteMapping("/api/inspiration-images/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        deleteInspirationImageUseCase.execute(CurrentUser.id(), id);
    }
}
