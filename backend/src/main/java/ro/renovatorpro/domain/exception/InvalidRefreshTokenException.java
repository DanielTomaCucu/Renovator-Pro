package ro.renovatorpro.domain.exception;

/** Token lipsă, expirat, revocat sau necunoscut — un singur mesaj, nu distingem cazul (nimic de exploatat). */
public class InvalidRefreshTokenException extends DomainException {

    public InvalidRefreshTokenException() {
        super("Sesiune expirată, autentifică-te din nou");
    }
}
