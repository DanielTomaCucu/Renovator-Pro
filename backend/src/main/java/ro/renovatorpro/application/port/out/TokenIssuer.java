package ro.renovatorpro.application.port.out;

import java.util.Optional;

/** Emite/validează access token-uri JWT (HS256, 15 min) — implementare JJWT în adapter/out/security. */
public interface TokenIssuer {

    String issueAccessToken(String userId, String username);

    /** Gol dacă tokenul e absent, malformat, expirat sau are semnătură invalidă — un singur caz de eroare la apelant. */
    Optional<String> validateAndExtractUserId(String accessToken);
}
