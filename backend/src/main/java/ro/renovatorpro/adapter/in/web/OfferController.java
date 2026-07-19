package ro.renovatorpro.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.OfferCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.OfferResponse;
import ro.renovatorpro.adapter.in.web.dto.OfferUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.OfferDtoMapper;
import ro.renovatorpro.application.port.in.AddOfferUseCase;
import ro.renovatorpro.application.port.in.DeleteOfferUseCase;
import ro.renovatorpro.application.port.in.UpdateOfferUseCase;

@RestController
@RequiredArgsConstructor
public class OfferController {

    private final AddOfferUseCase addOfferUseCase;
    private final UpdateOfferUseCase updateOfferUseCase;
    private final DeleteOfferUseCase deleteOfferUseCase;
    private final OfferDtoMapper mapper;

    @PostMapping("/api/comparison-groups/{groupId}/offers")
    @ResponseStatus(HttpStatus.CREATED)
    public OfferResponse create(@PathVariable String groupId, @Valid @RequestBody OfferCreateRequest request) {
        AddOfferUseCase.Command command = mapper.toAddCommand(request);
        return mapper.toResponse(addOfferUseCase.execute(CurrentUser.id(), groupId, command));
    }

    @PatchMapping("/api/offers/{id}")
    public OfferResponse update(@PathVariable String id, @RequestBody OfferUpdateRequest request) {
        UpdateOfferUseCase.Command command = mapper.toUpdateCommand(request);
        return mapper.toResponse(updateOfferUseCase.execute(CurrentUser.id(), id, command));
    }

    @DeleteMapping("/api/offers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        deleteOfferUseCase.execute(CurrentUser.id(), id);
    }
}
