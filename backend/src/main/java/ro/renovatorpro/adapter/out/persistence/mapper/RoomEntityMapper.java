package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ro.renovatorpro.adapter.out.persistence.entity.RoomEntity;
import ro.renovatorpro.domain.model.Room;

/**
 * {@code projectId} există doar pe {@link RoomEntity} — {@code domain.model.Room} nu-l cunoaște
 * (frontend-ul actual e single-project; vezi nota din docs/api-contract.md §Room). De-asta
 * {@link #toEntity} primește {@code projectId} ca parametru separat, nu din obiectul de domeniu.
 */
@Mapper(componentModel = "spring")
public interface RoomEntityMapper {

    Room toDomain(RoomEntity entity);

    @Mapping(target = "projectId", source = "projectId")
    RoomEntity toEntity(Room room, String projectId);
}
