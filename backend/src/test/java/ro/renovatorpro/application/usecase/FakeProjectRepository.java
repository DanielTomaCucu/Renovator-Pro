package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Fake in-memory (fără Spring/DB) — pentru testele de use case, conform DoD Task 3.2 / Faza 5. */
class FakeProjectRepository implements ProjectRepository {

    private final Map<String, Project> store = new HashMap<>();
    private final Map<String, String> ownerIdByProjectId = new HashMap<>();
    private final Map<String, String> inviteCodeByProjectId = new HashMap<>();
    private final Map<String, String> projectIdByInviteCode = new HashMap<>();

    void seed(Project project) {
        store.put(project.id(), project);
    }

    void seed(Project project, String ownerId) {
        store.put(project.id(), project);
        ownerIdByProjectId.put(project.id(), ownerId);
    }

    @Override
    public Optional<Project> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Project update(Project project) {
        if (!store.containsKey(project.id())) {
            throw new ProjectNotFoundException(project.id());
        }
        store.put(project.id(), project);
        return project;
    }

    @Override
    public Project insert(Project project, String ownerId) {
        store.put(project.id(), project);
        ownerIdByProjectId.put(project.id(), ownerId);
        return project;
    }

    @Override
    public Optional<String> findOwnerId(String projectId) {
        return Optional.ofNullable(ownerIdByProjectId.get(projectId));
    }

    @Override
    public void changeOwner(String projectId, String newOwnerId) {
        if (!store.containsKey(projectId)) {
            throw new ProjectNotFoundException(projectId);
        }
        ownerIdByProjectId.put(projectId, newOwnerId);
    }

    @Override
    public Optional<String> findInviteCode(String projectId) {
        return Optional.ofNullable(inviteCodeByProjectId.get(projectId));
    }

    @Override
    public boolean trySetInviteCode(String projectId, String inviteCode) {
        if (projectIdByInviteCode.containsKey(inviteCode)) {
            return false;
        }
        inviteCodeByProjectId.put(projectId, inviteCode);
        projectIdByInviteCode.put(inviteCode, projectId);
        return true;
    }

    @Override
    public Optional<String> findProjectIdByInviteCode(String inviteCode) {
        return Optional.ofNullable(projectIdByInviteCode.get(inviteCode));
    }
}
