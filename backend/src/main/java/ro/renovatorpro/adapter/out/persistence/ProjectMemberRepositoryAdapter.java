package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectMemberEntity;
import ro.renovatorpro.adapter.out.persistence.springdata.ProjectMemberJpaRepository;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectMemberRepositoryAdapter implements ProjectMemberRepository {

    private final ProjectMemberJpaRepository jpaRepository;

    @Override
    public Optional<ProjectRole> findRole(String projectId, String userId) {
        return jpaRepository.findByProjectIdAndUserId(projectId, userId)
                .map(entity -> ProjectRole.valueOf(entity.getRole()));
    }

    @Override
    public void save(ProjectMember member) {
        jpaRepository.save(new ProjectMemberEntity(member.projectId(), member.userId(), member.role().name()));
    }

    @Override
    public List<ProjectMember> findByProjectId(String projectId) {
        return jpaRepository.findByProjectId(projectId).stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<ProjectMember> findByUserId(String userId) {
        return jpaRepository.findFirstByUserId(userId).map(this::toDomain);
    }

    @Override
    public void deleteMember(String projectId, String userId) {
        jpaRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    private ProjectMember toDomain(ProjectMemberEntity entity) {
        return new ProjectMember(entity.getProjectId(), entity.getUserId(), ProjectRole.valueOf(entity.getRole()));
    }
}
