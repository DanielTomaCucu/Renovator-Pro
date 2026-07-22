package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository {

    Optional<ProjectRole> findRole(String projectId, String userId);

    void save(ProjectMember member);

    List<ProjectMember> findByProjectId(String projectId);

    /** Multi-proiect (V11): toate apartenențele unui user, cea mai veche (proiectul „de-acasă") întâi. */
    List<ProjectMember> findAllByUserId(String userId);

    void deleteMember(String projectId, String userId);
}
