package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ro.renovatorpro.adapter.in.web.dto.RoomCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.RoomDimensionsDto;
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
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;
import ro.renovatorpro.domain.service.RoomDimensionsCalculator;

import java.util.EnumMap;
import java.util.Map;

/**
 * {@code projectId} există doar pe {@link RoomResponse} — {@code domain.model.Room} nu-l cunoaște
 * (single-project azi, la fel ca la {@code RoomEntityMapper} din adapter/out/persistence).
 */
@Mapper(componentModel = "spring", uses = DtoConversionSupport.class)
public interface RoomDtoMapper {

    @Mapping(target = "projectId", source = "projectId")
    @Mapping(target = "dimensions", expression = "java(toDimensions(room))")
    RoomResponse toResponse(Room room, String projectId);

    /** Necesarul de material calculat server-side din {@link RoomDimensionsCalculator} — sursa de adevăr (Problema 2). */
    default RoomDimensionsDto toDimensions(Room room) {
        return new RoomDimensionsDto(
                RoomDimensionsCalculator.hasFloorConfig(room),
                RoomDimensionsCalculator.floorMaterialNeeded(room),
                RoomDimensionsCalculator.baseboardLength(room),
                RoomDimensionsCalculator.baseboardTileArea(room),
                RoomDimensionsCalculator.wallTilingArea(room),
                RoomDimensionsCalculator.wallFinishArea(room, WallFinishType.VOPSEA),
                RoomDimensionsCalculator.wallFinishArea(room, WallFinishType.TAPET),
                RoomDimensionsCalculator.windowTrimLength(room),
                RoomDimensionsCalculator.totalDoorWidth(room)
        );
    }

    AddRoomUseCase.Command toAddCommand(RoomCreateRequest request);

    /**
     * Scris manual (nu MapStruct auto) — traduce fiecare {@code JsonNullable} într-un {@link ro.renovatorpro.application.port.in.Patch}
     * (Problema 6 din audit: distincția absent/null explicit trebuie păstrată până în {@code UpdateRoomService}).
     */
    default UpdateRoomUseCase.Command toUpdateCommand(RoomUpdateRequest request) {
        return new UpdateRoomUseCase.Command(
                DtoConversionSupport.toRoomType(request.type()),
                request.name(),
                DtoConversionSupport.toMoney(request.allocatedBudget()),
                DtoConversionSupport.toPatch(request.floorMaterial(), DtoConversionSupport::toFlooringType),
                DtoConversionSupport.toPatch(request.floorArea()),
                DtoConversionSupport.toPatch(request.perimeter()),
                DtoConversionSupport.toPatch(request.tileSize(), DtoConversionSupport::toTileSize),
                DtoConversionSupport.toPatch(request.installationType(), DtoConversionSupport::toInstallationType),
                DtoConversionSupport.toPatch(request.doors(), this::toDoorsMap),
                DtoConversionSupport.toPatch(request.baseboardHeight()),
                DtoConversionSupport.toPatch(request.wallShape(), DtoConversionSupport::toRoomShape),
                DtoConversionSupport.toPatch(request.wallTiling(), this::toDomain),
                DtoConversionSupport.toPatch(request.wallFinish(), this::toDomain),
                DtoConversionSupport.toPatch(request.windows(), this::toWindowsMap)
        );
    }

    /** {@code Map<String, RoomDoorDto>} (chei = label {@link Wall}) → {@code Map<Wall, RoomDoor>}. Null-safe. */
    default Map<Wall, RoomDoor> toDoorsMap(Map<String, RoomDoorDto> doors) {
        if (doors == null) return null;
        Map<Wall, RoomDoor> result = new EnumMap<>(Wall.class);
        doors.forEach((label, dto) -> result.put(DtoConversionSupport.toWall(label), toDomain(dto)));
        return result;
    }

    /** {@code Map<String, RoomWindowDto>} (chei = label {@link Wall}) → {@code Map<Wall, RoomWindow>}. Null-safe. */
    default Map<Wall, RoomWindow> toWindowsMap(Map<String, RoomWindowDto> windows) {
        if (windows == null) return null;
        Map<Wall, RoomWindow> result = new EnumMap<>(Wall.class);
        windows.forEach((label, dto) -> result.put(DtoConversionSupport.toWall(label), toDomain(dto)));
        return result;
    }

    RoomDoorDto toDto(RoomDoor door);

    RoomDoor toDomain(RoomDoorDto dto);

    RoomWindowDto toDto(RoomWindow window);

    RoomWindow toDomain(RoomWindowDto dto);

    WallTilingDto toDto(WallTiling tiling);

    WallTiling toDomain(WallTilingDto dto);

    WallFinishDto toDto(WallFinish finish);

    WallFinish toDomain(WallFinishDto dto);
}
