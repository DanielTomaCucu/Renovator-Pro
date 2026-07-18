package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.LogoutUseCase;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TokenHasher;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;

    @Override
    @Transactional
    public void execute(String rawRefreshToken) {
        // Idempotent intenționat: logout fără cookie valid (deja expirat/lipsă) nu e o eroare, doar un no-op.
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(tokenHasher.hash(rawRefreshToken))
                .ifPresent(stored -> refreshTokenRepository.revoke(stored.id()));
    }
}
