package ro.renovatorpro.application.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;

@Service
public class UpdateProjectService implements UpdateProjectUseCase {

    private final ProjectRepository projectRepository;

    public UpdateProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public Project execute(String currentUserId, String projectId, Command command) {
        Project existing = projectRepository.findById(projectId).orElseThrow(() -> new ProjectNotFoundException(projectId));
        Project patched = new Project(
                existing.id(),
                command.title() != null ? command.title() : existing.title(),
                command.totalBudget() != null ? command.totalBudget() : existing.totalBudget(),
                command.currency() != null ? command.currency() : existing.currency(),
                command.totalArea() != null ? command.totalArea() : existing.totalArea()
        );
        return projectRepository.update(patched);
    }
}
