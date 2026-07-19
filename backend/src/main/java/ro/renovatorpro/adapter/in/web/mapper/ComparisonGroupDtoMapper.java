package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupResponse;
import ro.renovatorpro.adapter.in.web.dto.ComparisonGroupUpdateRequest;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.UpdateComparisonGroupUseCase;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OfferDtoMapper.class, DtoConversionSupport.class})
public interface ComparisonGroupDtoMapper {

    AddComparisonGroupUseCase.Command toAddCommand(ComparisonGroupCreateRequest request);

    UpdateComparisonGroupUseCase.Command toUpdateCommand(ComparisonGroupUpdateRequest request);

    /** Combină grupul + ofertele lui (surse separate — repo-uri distincte, ca la Room/Item) într-un singur DTO nested. */
    ComparisonGroupResponse toResponse(ComparisonGroup group, List<Offer> offers);
}
