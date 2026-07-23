package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.mapper.InspirationImageEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.InspirationImageJpaRepository;
import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.domain.model.InspirationImage;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InspirationImageRepositoryAdapter implements InspirationImageRepository {

    private final InspirationImageJpaRepository jpaRepository;
    private final InspirationImageEntityMapper mapper;

    @Override
    public Optional<InspirationImage> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<InspirationImage> findByProjectId(String projectId) {
        return jpaRepository.findByProjectId(projectId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public InspirationImage save(InspirationImage image) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(image)));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void clearRoomId(String roomId) {
        jpaRepository.clearRoomId(roomId);
    }
}
