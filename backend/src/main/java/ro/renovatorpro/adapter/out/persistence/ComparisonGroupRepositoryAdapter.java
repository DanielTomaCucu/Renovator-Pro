package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.mapper.ComparisonGroupEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.ComparisonGroupJpaRepository;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.domain.model.ComparisonGroup;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ComparisonGroupRepositoryAdapter implements ComparisonGroupRepository {

    private final ComparisonGroupJpaRepository jpaRepository;
    private final ComparisonGroupEntityMapper mapper;

    @Override
    public Optional<ComparisonGroup> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ComparisonGroup> findByRoomId(String roomId) {
        return jpaRepository.findByRoomId(roomId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<ComparisonGroup> findByRoomIds(List<String> roomIds) {
        return jpaRepository.findByRoomIdIn(roomIds).stream().map(mapper::toDomain).toList();
    }

    @Override
    public ComparisonGroup save(ComparisonGroup group) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(group)));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByRoomId(String roomId) {
        jpaRepository.deleteByRoomId(roomId);
    }
}
