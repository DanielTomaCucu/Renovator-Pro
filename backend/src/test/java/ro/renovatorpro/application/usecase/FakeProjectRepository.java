package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Fake in-memory (fără Spring/DB) — pentru testele de use case, conform DoD Task 3.2. */
class FakeProjectRepository implements ProjectRepository {

    private final Map<String, Project> store = new HashMap<>();

    void seed(Project project) {
        store.put(project.id(), project);
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
}
