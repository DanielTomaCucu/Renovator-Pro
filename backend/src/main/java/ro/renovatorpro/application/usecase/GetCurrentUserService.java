package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetCurrentUserUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

@Service
@RequiredArgsConstructor
public class GetCurrentUserService implements GetCurrentUserUseCase {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;

    @Override
    @Transactional(readOnly = true)
    public Result execute(String currentUserId, String rawRefreshToken) {
        // Userul vine dintr-un JWT deja validat de JwtAuthenticationFilter — dacă lipsește din DB
        // (cont șters între timp), tratăm ca sesiune invalidă, nu ca eroare de server.
        User user = userRepository.findById(currentUserId).orElseThrow(InvalidRefreshTokenException::new);
        String projectId = resolveActiveProjectId(currentUserId, rawRefreshToken);
        ProjectRole role = projectMemberRepository.findRole(projectId, currentUserId)
                .orElseThrow(InvalidRefreshTokenException::new);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        return new Result(user, project, role);
    }

    /**
     * Proiectul activ = cel al sesiunii curente (V11) — încifrat implicit în refresh token-ul cu care a
     * venit cererea (rotire recentă la boot, vezi `authApi.silentRefresh` din frontend). Fallback (fără
     * cookie valid — nu ar trebui să apară în fluxul normal): cel mai vechi proiect al userului.
     */
    private String resolveActiveProjectId(String userId, String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            var stored = refreshTokenRepository.findByTokenHash(tokenHasher.hash(rawRefreshToken));
            if (stored.isPresent() && stored.get().userId().equals(userId)) {
                return stored.get().projectId();
            }
        }
        return projectMemberRepository.findAllByUserId(userId).stream()
                .findFirst()
                .map(ProjectMember::projectId)
                .orElseThrow(InvalidRefreshTokenException::new);
    }
}
