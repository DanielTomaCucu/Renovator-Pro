package ro.renovatorpro.application.port.out;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository {

    record StoredToken(String id, String userId, String projectId, String tokenHash, Instant expiresAt, Instant revokedAt) {
    }

    /** {@code projectId} = proiectul activ al acestei sesiuni (V11) — o comutare de proiect rotește tokenul, nu userul. */
    void insert(String id, String userId, String projectId, String tokenHash, Instant expiresAt);

    Optional<StoredToken> findByTokenHash(String tokenHash);

    /** Rotire (Faza 5 §5.4): tokenul folosit se revocă, indiferent dacă emitem unul nou după. */
    void revoke(String id);

    /** Logout / ștergere membru — taie accesul viitor prin refresh, indiferent de câte token-uri active are userul. */
    void revokeAllForUser(String userId);
}
