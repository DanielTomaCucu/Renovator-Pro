package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ListMyProjectsUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.user.ProjectMember;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListMyProjectsService implements ListMyProjectsUseCase {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Result> execute(String currentUserId) {
        return projectMemberRepository.findAllByUserId(currentUserId).stream()
                .map(this::toResult)
                .toList();
    }

    private Result toResult(ProjectMember membership) {
        var project = projectRepository.findById(membership.projectId())
                .orElseThrow(() -> new ProjectNotFoundException(membership.projectId()));
        return new Result(project, membership.role());
    }
}
