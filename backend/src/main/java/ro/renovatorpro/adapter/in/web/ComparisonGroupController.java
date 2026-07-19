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
import ro.renovatorpro.adapter.in.web.dto.ChooseOfferRequest;
import ro.renovatorpro.adapter.in.web.dto.ChooseOfferResponse;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupResponse;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.ComparisonGroupDtoMapper;
import ro.renovatorpro.adapter.in.web.mapper.ItemDtoMapper;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.ChooseOfferUseCase;
import ro.renovatorpro.application.port.in.DeleteComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.GetComparisonGroupsUseCase;
import ro.renovatorpro.application.port.in.UpdateComparisonGroupUseCase;
import ro.renovatorpro.domain.model.ComparisonGroup;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ComparisonGroupController {

    private final GetComparisonGroupsUseCase getComparisonGroupsUseCase;
    private final AddComparisonGroupUseCase addComparisonGroupUseCase;
    private final UpdateComparisonGroupUseCase updateComparisonGroupUseCase;
    private final DeleteComparisonGroupUseCase deleteComparisonGroupUseCase;
    private final ChooseOfferUseCase chooseOfferUseCase;
    private final ComparisonGroupDtoMapper mapper;
    private final ItemDtoMapper itemMapper;

    @GetMapping("/api/projects/{projectId}/comparison-groups")
    public List<ComparisonGroupResponse> list(@PathVariable String projectId) {
        return getComparisonGroupsUseCase.execute(CurrentUser.id(), projectId).stream()
                .map(g -> mapper.toResponse(g.group(), g.offers()))
                .toList();
    }

    @PostMapping("/api/rooms/{roomId}/comparison-groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ComparisonGroupResponse create(@PathVariable String roomId, @Valid @RequestBody ComparisonGroupCreateRequest request) {
        AddComparisonGroupUseCase.Command command = mapper.toAddCommand(request);
        ComparisonGroup group = addComparisonGroupUseCase.execute(CurrentUser.id(), roomId, command);
        return mapper.toResponse(group, List.of());
    }

    @PatchMapping("/api/comparison-groups/{id}")
    public ComparisonGroupResponse update(@PathVariable String id, @RequestBody ComparisonGroupUpdateRequest request) {
        UpdateComparisonGroupUseCase.Command command = mapper.toUpdateCommand(request);
        GetComparisonGroupsUseCase.GroupWithOffers result = updateComparisonGroupUseCase.execute(CurrentUser.id(), id, command);
        return mapper.toResponse(result.group(), result.offers());
    }

    @DeleteMapping("/api/comparison-groups/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        deleteComparisonGroupUseCase.execute(CurrentUser.id(), id);
    }

    @PostMapping("/api/comparison-groups/{id}/choose")
    public ChooseOfferResponse choose(@PathVariable String id, @Valid @RequestBody ChooseOfferRequest request) {
        ChooseOfferUseCase.Command command = new ChooseOfferUseCase.Command(request.offerId(), request.quantity());
        ChooseOfferUseCase.Result result = chooseOfferUseCase.execute(CurrentUser.id(), id, command);
        return new ChooseOfferResponse(mapper.toResponse(result.group(), result.offers()), itemMapper.toResponse(result.item()));
    }
}
