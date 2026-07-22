package ro.renovatorpro.application.port.out;

import java.time.Instant;
import java.util.Optional;

/** Pattern identic cu {@link RefreshTokenRepository} — valoare opacă, stocată DOAR hash-uită. */
public interface PasswordResetTokenRepository {

    record StoredToken(String id, String userId, String tokenHash, Instant expiresAt, Instant usedAt) {
    }

    void insert(String id, String userId, String tokenHash, Instant expiresAt);

    Optional<StoredToken> findByTokenHash(String tokenHash);

    /** Folosire unică — marchează tokenul consumat, indiferent dacă `execute`-ul din urmă reușește. */
    void markUsed(String id);
}
