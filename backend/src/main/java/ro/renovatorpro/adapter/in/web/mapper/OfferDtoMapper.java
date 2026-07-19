package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.OfferCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.OfferResponse;
import ro.renovatorpro.adapter.in.web.dto.OfferUpdateRequest;
import ro.renovatorpro.application.port.in.AddOfferUseCase;
import ro.renovatorpro.application.port.in.UpdateOfferUseCase;
import ro.renovatorpro.domain.model.Offer;

@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface OfferDtoMapper {

    OfferResponse toResponse(Offer offer);

    AddOfferUseCase.Command toAddCommand(OfferCreateRequest request);

    /** Scris manual (nu auto-mapping MapStruct) — fiecare câmp trece explicit prin {@code Patch}, cu conversia Money pe unitPrice. */
    default UpdateOfferUseCase.Command toUpdateCommand(OfferUpdateRequest request) {
        return new UpdateOfferUseCase.Command(
                DtoConversionSupport.toPatch(request.name()),
                DtoConversionSupport.toPatch(request.store()),
                DtoConversionSupport.toPatch(request.unitPrice(), DtoConversionSupport::toMoney),
                DtoConversionSupport.toPatch(request.quantity()),
                DtoConversionSupport.toPatch(request.productUrl()),
                DtoConversionSupport.toPatch(request.images()),
                DtoConversionSupport.toPatch(request.notes())
        );
    }
}
