package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectEntity;
import ro.renovatorpro.adapter.out.persistence.mapper.ProjectEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.ProjectJpaRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectRepositoryAdapter implements ProjectRepository {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectEntityMapper mapper;

    @Override
    public Optional<Project> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Project update(Project project) {
        ProjectEntity existing = jpaRepository.findById(project.id())
                .orElseThrow(() -> new ProjectNotFoundException(project.id()));
        ProjectEntity updated = mapper.toEntity(project, existing.getOwnerId());
        // toEntity() nu cunoaște inviteCode (nu e câmp de domeniu) — fără asta, orice update obișnuit
        // (titlu/buget) l-ar șterge silențios.
        updated.setInviteCode(existing.getInviteCode());
        return mapper.toDomain(jpaRepository.save(updated));
    }

    @Override
    public Project insert(Project project, String ownerId) {
        ProjectEntity entity = mapper.toEntity(project, ownerId);
        return mapper.toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<String> findOwnerId(String projectId) {
        return jpaRepository.findById(projectId).map(ProjectEntity::getOwnerId);
    }

    @Override
    public void changeOwner(String projectId, String newOwnerId) {
        ProjectEntity existing = jpaRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        existing.setOwnerId(newOwnerId);
        jpaRepository.save(existing);
    }

    @Override
    public Optional<String> findInviteCode(String projectId) {
        return jpaRepository.findById(projectId).map(ProjectEntity::getInviteCode);
    }

    @Override
    public boolean trySetInviteCode(String projectId, String inviteCode) {
        ProjectEntity existing = jpaRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        existing.setInviteCode(inviteCode);
        try {
            jpaRepository.saveAndFlush(existing);
            return true;
        } catch (DataIntegrityViolationException collision) {
            return false;
        }
    }

    @Override
    public Optional<String> findProjectIdByInviteCode(String inviteCode) {
        return jpaRepository.findByInviteCode(inviteCode).map(ProjectEntity::getId);
    }
}
