package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetCurrentUserUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.User;

@Service
@RequiredArgsConstructor
public class GetCurrentUserService implements GetCurrentUserUseCase {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public Result execute(String currentUserId) {
        // Userul vine dintr-un JWT deja validat de JwtAuthenticationFilter — dacă lipsește din DB
        // (cont șters între timp), tratăm ca sesiune invalidă, nu ca eroare de server.
        User user = userRepository.findById(currentUserId).orElseThrow(InvalidRefreshTokenException::new);
        ProjectMember membership = projectMemberRepository.findByUserId(currentUserId)
                .orElseThrow(InvalidRefreshTokenException::new);
        Project project = projectRepository.findById(membership.projectId())
                .orElseThrow(() -> new ProjectNotFoundException(membership.projectId()));
        return new Result(user, project, membership.role());
    }
}
