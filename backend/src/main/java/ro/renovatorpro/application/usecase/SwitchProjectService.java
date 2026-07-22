package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.SwitchProjectUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.SessionIssuer;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

@Service
@RequiredArgsConstructor
public class SwitchProjectService implements SwitchProjectUseCase {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;
    private final SessionIssuer sessionIssuer;

    @Override
    @Transactional
    public AuthResult execute(String currentUserId, String rawCurrentRefreshToken, String targetProjectId) {
        User user = userRepository.findById(currentUserId).orElseThrow(InvalidRefreshTokenException::new);
        // Nemembru al proiectului țintă → 404 uniform (IDOR — nu confirmăm existența proiectului cuiva din afară).
        ProjectRole role = projectMemberRepository.findRole(targetProjectId, currentUserId)
                .orElseThrow(() -> new ProjectNotFoundException(targetProjectId));
        Project project = projectRepository.findById(targetProjectId)
                .orElseThrow(() -> new ProjectNotFoundException(targetProjectId));

        if (rawCurrentRefreshToken != null && !rawCurrentRefreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(tokenHasher.hash(rawCurrentRefreshToken))
                    .ifPresent(stored -> refreshTokenRepository.revoke(stored.id()));
        }
        return sessionIssuer.issue(user, project, role);
    }
}
