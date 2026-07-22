package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageResponse;
import ro.renovatorpro.adapter.in.web.dto.InspirationImageUpdateRequest;
import ro.renovatorpro.application.port.in.AddInspirationImageUseCase;
import ro.renovatorpro.application.port.in.UpdateInspirationImageUseCase;
import ro.renovatorpro.domain.model.InspirationImage;

@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface InspirationImageDtoMapper {

    InspirationImageResponse toResponse(InspirationImage image);

    AddInspirationImageUseCase.Command toAddCommand(InspirationImageCreateRequest request);

    /** Scris manual (nu auto-mapping MapStruct) — fiecare câmp trece explicit prin {@code Patch}, cu conversia enum pe type. */
    default UpdateInspirationImageUseCase.Command toUpdateCommand(InspirationImageUpdateRequest request) {
        return new UpdateInspirationImageUseCase.Command(
                DtoConversionSupport.toPatch(request.roomId()),
                DtoConversionSupport.toPatch(request.type(), DtoConversionSupport::toInspirationType),
                DtoConversionSupport.toPatch(request.image()),
                DtoConversionSupport.toPatch(request.caption()),
                DtoConversionSupport.toPatch(request.sourceUrl())
        );
    }
}
