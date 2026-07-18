package ro.renovatorpro.application.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ro.renovatorpro.domain.exception.AccountLockedException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Lockout per-username la autentificare (SEC-7, docs/tickete-audit-calcule-securitate.md) — completează
 * {@code AuthRateLimitFilter} (per-IP): un atacator distribuit pe mai multe IP-uri (sau care falsifică
 * {@code X-Forwarded-For}) poate încerca parole pe ACELAȘI username din multe „IP-uri" diferite; rate
 * limiter-ul per-IP nu-l oprește, dar acest guard, per-username, da.
 *
 * <p>LIMITARE CUNOSCUTĂ (aceeași ca {@code AuthRateLimitFilter}): stare doar în procesul curent, nu
 * supraviețuiește restart-ului și nu se sincronizează multi-instanță — suficient pe Render free tier
 * (o singură instanță). Dacă aplicația ajunge multi-instanță sau se dorește persistență peste restart,
 * mută starea într-o coloană pe {@code users} (ex. {@code failed_login_attempts}, {@code locked_until}).
 */
@Component
public class LoginLockoutGuard {

    private record Attempts(AtomicLong failures, java.util.concurrent.atomic.AtomicReference<Instant> lockedUntil) {
    }

    private final int maxFailedAttempts;
    private final Duration lockoutDuration;

    private final Map<String, Attempts> attemptsByUsername = new ConcurrentHashMap<>();

    public LoginLockoutGuard(
            @Value("${app.auth.lockout.max-failed-attempts:5}") int maxFailedAttempts,
            @Value("${app.auth.lockout.duration-minutes:15}") long lockoutDurationMinutes) {
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockoutDuration = Duration.ofMinutes(lockoutDurationMinutes);
    }

    /** Aruncă {@link AccountLockedException} dacă username-ul (normalizat) e blocat curent. Apelat ÎNAINTE de verificarea parolei. */
    public void checkNotLocked(String normalizedUsername) {
        Attempts attempts = attemptsByUsername.get(normalizedUsername);
        if (attempts == null) return;
        Instant lockedUntil = attempts.lockedUntil().get();
        if (lockedUntil != null && lockedUntil.isAfter(Instant.now())) {
            throw new AccountLockedException();
        }
    }

    /** Înregistrează un eșec (user inexistent SAU parolă greșită — tratate identic, ca să nu confirmăm existența contului). */
    public void recordFailure(String normalizedUsername) {
        Attempts attempts = attemptsByUsername.computeIfAbsent(normalizedUsername,
                key -> new Attempts(new AtomicLong(), new java.util.concurrent.atomic.AtomicReference<>()));
        long failures = attempts.failures().incrementAndGet();
        if (failures >= maxFailedAttempts) {
            attempts.lockedUntil().set(Instant.now().plus(lockoutDuration));
        }
    }

    /** Reset la login reușit — nu penalizăm încercări vechi odată ce userul și-a dovedit identitatea. */
    public void recordSuccess(String normalizedUsername) {
        attemptsByUsername.remove(normalizedUsername);
    }
}
