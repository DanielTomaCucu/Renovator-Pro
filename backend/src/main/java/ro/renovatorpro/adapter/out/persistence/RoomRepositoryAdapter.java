package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.RoomEntity;
import ro.renovatorpro.adapter.out.persistence.mapper.RoomEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.RoomJpaRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.Room;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoomRepositoryAdapter implements RoomRepository {

    private final RoomJpaRepository jpaRepository;
    private final RoomEntityMapper mapper;

    @Override
    public Optional<Room> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Room> findByProjectId(String projectId) {
        return jpaRepository.findByProjectId(projectId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Room insert(Room room, String projectId) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(room, projectId)));
    }

    @Override
    public Room update(Room room) {
        RoomEntity existing = jpaRepository.findById(room.id())
                .orElseThrow(() -> new RoomNotFoundException(room.id()));
        RoomEntity updated = mapper.toEntity(room, existing.getProjectId());
        return mapper.toDomain(jpaRepository.save(updated));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }
}
