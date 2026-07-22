package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.JoinProjectUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.SessionIssuer;
import ro.renovatorpro.domain.exception.InvalidInviteCodeException;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

@Service
@RequiredArgsConstructor
public class JoinProjectService implements JoinProjectUseCase {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TimeProvider timeProvider;
    private final SessionIssuer sessionIssuer;

    @Override
    @Transactional
    public AuthResult execute(String currentUserId, String inviteCode) {
        // Userul vine dintr-un JWT deja validat — lipsa din DB ar însemna cont șters între timp.
        User user = userRepository.findById(currentUserId).orElseThrow(InvalidRefreshTokenException::new);
        String projectId = projectRepository.findProjectIdByInviteCode(inviteCode.trim())
                .orElseThrow(InvalidInviteCodeException::new);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        ProjectRole role = projectMemberRepository.findRole(projectId, currentUserId)
                .orElseGet(() -> {
                    // Idempotent: dacă e deja membru (ex. codul propriului proiect), nu duplicăm rândul.
                    projectMemberRepository.save(new ProjectMember(projectId, currentUserId, ProjectRole.EDITOR, timeProvider.now()));
                    return ProjectRole.EDITOR;
                });
        return sessionIssuer.issue(user, project, role);
    }
}
