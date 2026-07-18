package ro.renovatorpro.adapter.out.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.TokenIssuer;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/** Access token JWT, HS256, TTL scurt (15 min) — secret exclusiv din env var (blueprint §5). */
@Component
public class JjwtTokenIssuer implements TokenIssuer {

    private static final String CLAIM_USERNAME = "username";

    private final SecretKey key;
    private final Duration ttl;

    public JjwtTokenIssuer(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-ttl-minutes}") long ttlMinutes
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    @Override
    public String issueAccessToken(String userId, String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .claim(CLAIM_USERNAME, username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    @Override
    public Optional<String> validateAndExtractUserId(String accessToken) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(accessToken)
                    .getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException invalid) {
            return Optional.empty();
        }
    }
}
