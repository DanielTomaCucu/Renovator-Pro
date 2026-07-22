package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Fake in-memory (fără Spring/DB) — folosit pentru a construi un {@code MembershipGuard} real în teste. */
class FakeProjectMemberRepository implements ProjectMemberRepository {

    private final Map<String, ProjectMember> membersByProjectAndUser = new HashMap<>();
    // Contor determinist pt. joinedAt — ordinea apelurilor `grant` contează pt. teste (proiectul „de-acasă" e primul).
    private int joinCounter = 0;

    void grant(String projectId, String userId, ProjectRole role) {
        save(new ProjectMember(projectId, userId, role, Instant.EPOCH.plusSeconds(joinCounter++)));
    }

    @Override
    public Optional<ProjectRole> findRole(String projectId, String userId) {
        return Optional.ofNullable(membersByProjectAndUser.get(key(projectId, userId))).map(ProjectMember::role);
    }

    @Override
    public void save(ProjectMember member) {
        membersByProjectAndUser.put(key(member.projectId(), member.userId()), member);
    }

    @Override
    public List<ProjectMember> findByProjectId(String projectId) {
        List<ProjectMember> result = new ArrayList<>();
        for (ProjectMember member : membersByProjectAndUser.values()) {
            if (member.projectId().equals(projectId)) {
                result.add(member);
            }
        }
        return result;
    }

    @Override
    public List<ProjectMember> findAllByUserId(String userId) {
        return membersByProjectAndUser.values().stream()
                .filter(m -> m.userId().equals(userId))
                .sorted(Comparator.comparing(ProjectMember::joinedAt))
                .toList();
    }

    @Override
    public void deleteMember(String projectId, String userId) {
        membersByProjectAndUser.remove(key(projectId, userId));
    }

    private static String key(String projectId, String userId) {
        return projectId + ":" + userId;
    }
}
