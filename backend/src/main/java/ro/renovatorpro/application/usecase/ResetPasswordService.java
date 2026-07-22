package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ResetPasswordUseCase;
import ro.renovatorpro.application.port.out.PasswordHasher;
import ro.renovatorpro.application.port.out.PasswordResetTokenRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.exception.InvalidPasswordResetTokenException;

@Service
@RequiredArgsConstructor
public class ResetPasswordService implements ResetPasswordUseCase {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;
    private final TimeProvider timeProvider;

    @Override
    @Transactional
    public void execute(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidPasswordResetTokenException();
        }
        PasswordResetTokenRepository.StoredToken stored = passwordResetTokenRepository
                .findByTokenHash(tokenHasher.hash(rawToken))
                .orElseThrow(InvalidPasswordResetTokenException::new);

        boolean expired = stored.expiresAt().isBefore(timeProvider.now());
        boolean used = stored.usedAt() != null;
        // Marchează folosit mereu, chiar dacă era deja expirat/folosit — apărare în adâncime, ca la refresh tokens.
        passwordResetTokenRepository.markUsed(stored.id());
        if (expired || used) {
            throw new InvalidPasswordResetTokenException();
        }

        userRepository.updatePasswordHash(stored.userId(), passwordHasher.hash(newPassword));
        // Cineva ar fi putut avea deja acces cu parola veche — o resetare taie TOATE sesiunile active.
        refreshTokenRepository.revokeAllForUser(stored.userId());
    }
}
