package ro.renovatorpro.application.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.SecureTokenGenerator;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.TokenIssuer;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

import java.time.Duration;

/**
 * Emite o sesiune nouă (access token JWT + refresh token opac, stocat hash-uit) — colaborator comun
 * folosit de register/login/refresh, ca cele trei să nu dubleze logica de emitere (blueprint §5).
 */
@Component
@RequiredArgsConstructor
public class SessionIssuer {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenIssuer tokenIssuer;
    private final TokenHasher tokenHasher;
    private final SecureTokenGenerator secureTokenGenerator;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;

    @Value("${app.auth.refresh-token-ttl-days}")
    private long refreshTokenTtlDays;

    public AuthResult issue(User user, Project project, ProjectRole role) {
        String accessToken = tokenIssuer.issueAccessToken(user.id(), user.username());
        String rawRefreshToken = secureTokenGenerator.generate();
        refreshTokenRepository.insert(idGenerator.newId(), user.id(), tokenHasher.hash(rawRefreshToken),
                timeProvider.now().plus(Duration.ofDays(refreshTokenTtlDays)));
        return new AuthResult(user, project, role, accessToken, rawRefreshToken);
    }
}
