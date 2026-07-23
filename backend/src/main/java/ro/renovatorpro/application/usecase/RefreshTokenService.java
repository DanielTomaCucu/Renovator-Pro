package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.RefreshTokenUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.SessionIssuer;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

/** Rotire strictă: tokenul prezentat se revocă mereu, indiferent dacă mai era valid — o singură folosire posibilă. */
@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TokenHasher tokenHasher;
    private final TimeProvider timeProvider;
    private final SessionIssuer sessionIssuer;

    @Override
    @Transactional
    public AuthResult execute(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }
        String hash = tokenHasher.hash(rawRefreshToken);
        RefreshTokenRepository.StoredToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(InvalidRefreshTokenException::new);

        boolean expired = stored.expiresAt().isBefore(timeProvider.now());
        boolean revoked = stored.revokedAt() != null;
        // Revocă mereu, chiar dacă era deja expirat/revocat — apărare în adâncime (reuse detection):
        // dacă un token vechi apare din nou, se asigură că rămâne mort.
        refreshTokenRepository.revoke(stored.id());
        if (expired || revoked) {
            throw new InvalidRefreshTokenException();
        }

        User user = userRepository.findById(stored.userId()).orElseThrow(InvalidRefreshTokenException::new);
        // Proiectul rămâne cel al SESIUNII (stored.projectId()), nu „primul" al userului — o comutare de
        // proiect a rotit deja tokenul spre noul proiect (SwitchProjectService); dacă userul a fost între
        // timp scos din ACEST proiect specific, findRole eșuează și refresh-ul cade corect (relogare).
        ProjectRole role = projectMemberRepository.findRole(stored.projectId(), user.id())
                .orElseThrow(InvalidRefreshTokenException::new);
        Project project = projectRepository.findById(stored.projectId())
                .orElseThrow(() -> new ProjectNotFoundException(stored.projectId()));
        return sessionIssuer.issue(user, project, role);
    }
}
