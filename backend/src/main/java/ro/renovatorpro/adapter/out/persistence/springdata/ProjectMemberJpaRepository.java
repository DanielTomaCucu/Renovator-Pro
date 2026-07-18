package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectMemberEntity;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberJpaRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberEntity.Key> {

    Optional<ProjectMemberEntity> findByProjectIdAndUserId(String projectId, String userId);

    List<ProjectMemberEntity> findByProjectId(String projectId);

    /** Single-project per user azi (D4) — la nevoie viitoare de multi-proiect, devine findAllByUserId. */
    Optional<ProjectMemberEntity> findFirstByUserId(String userId);

    void deleteByProjectIdAndUserId(String projectId, String userId);
}
