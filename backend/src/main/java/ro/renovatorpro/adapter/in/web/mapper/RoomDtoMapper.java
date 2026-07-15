package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ro.renovatorpro.adapter.in.web.dto.RoomCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.RoomDoorDto;
import ro.renovatorpro.adapter.in.web.dto.RoomResponse;
import ro.renovatorpro.adapter.in.web.dto.RoomUpdateRequest;
import ro.renovatorpro.adapter.in.web.dto.RoomWindowDto;
import ro.renovatorpro.adapter.in.web.dto.WallFinishDto;
import ro.renovatorpro.adapter.in.web.dto.WallTilingDto;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallTiling;

/**
 * {@code projectId} există doar pe {@link RoomResponse} — {@code domain.model.Room} nu-l cunoaște
 * (single-project azi, la fel ca la {@code RoomEntityMapper} din adapter/out/persistence).
 */
@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface RoomDtoMapper {

    @Mapping(target = "projectId", source = "projectId")
    RoomResponse toResponse(Room room, String projectId);

    AddRoomUseCase.Command toAddCommand(RoomCreateRequest request);

    UpdateRoomUseCase.Command toUpdateCommand(RoomUpdateRequest request);

    RoomDoorDto toDto(RoomDoor door);

    RoomDoor toDomain(RoomDoorDto dto);

    RoomWindowDto toDto(RoomWindow window);

    RoomWindow toDomain(RoomWindowDto dto);

    WallTilingDto toDto(WallTiling tiling);

    WallTiling toDomain(WallTilingDto dto);

    WallFinishDto toDto(WallFinish finish);

    WallFinish toDomain(WallFinishDto dto);
}
