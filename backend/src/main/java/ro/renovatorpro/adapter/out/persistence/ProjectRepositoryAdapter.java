package ro.renovatorpro.adapter.out.persistence;

import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectEntity;
import ro.renovatorpro.adapter.out.persistence.mapper.ProjectEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.ProjectJpaRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;

import java.util.Optional;

@Component
public class ProjectRepositoryAdapter implements ProjectRepository {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectEntityMapper mapper;

    public ProjectRepositoryAdapter(ProjectJpaRepository jpaRepository, ProjectEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Project> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Project update(Project project) {
        ProjectEntity existing = jpaRepository.findById(project.id())
                .orElseThrow(() -> new ProjectNotFoundException(project.id()));
        ProjectEntity updated = mapper.toEntity(project, existing.getOwnerId());
        return mapper.toDomain(jpaRepository.save(updated));
    }
}
