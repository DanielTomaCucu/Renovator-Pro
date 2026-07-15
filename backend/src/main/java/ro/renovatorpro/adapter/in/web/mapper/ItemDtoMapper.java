package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.ItemCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.ItemResponse;
import ro.renovatorpro.adapter.in.web.dto.ItemUpdateRequest;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.domain.model.Item;

@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface ItemDtoMapper {

    ItemResponse toResponse(Item item);

    AddItemUseCase.Command toAddCommand(ItemCreateRequest request);

    UpdateItemUseCase.Command toUpdateCommand(ItemUpdateRequest request);
}
