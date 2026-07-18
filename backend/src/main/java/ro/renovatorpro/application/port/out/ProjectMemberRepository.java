package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository {

    Optional<ProjectRole> findRole(String projectId, String userId);

    void save(ProjectMember member);

    List<ProjectMember> findByProjectId(String projectId);

    /** Proiectul la care e membru un user — Faza 5 e single-project per user (D4), deci cel mult un rezultat. */
    Optional<ProjectMember> findByUserId(String userId);

    void deleteMember(String projectId, String userId);
}
