package ro.renovatorpro.adapter.in.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ro.renovatorpro.domain.exception.AccountLockedException;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.exception.DomainException;
import ro.renovatorpro.domain.exception.DuplicateEmailException;
import ro.renovatorpro.domain.exception.DuplicateUsernameException;
import ro.renovatorpro.domain.exception.ExchangeRateFetchException;
import ro.renovatorpro.domain.exception.InvalidCredentialsException;
import ro.renovatorpro.domain.exception.InvalidInviteCodeException;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.InspirationImageNotFoundException;
import ro.renovatorpro.domain.exception.InvalidPasswordResetTokenException;
import ro.renovatorpro.domain.exception.InvalidRegistrationException;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
import ro.renovatorpro.domain.exception.OfferNotFoundException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.exception.RoomNotFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduce excepțiile de domeniu/validare în {@link ProblemDetail} (RFC 7807) — decizie de arhitectură
 * din blueprint §1. Domeniul/application nu știu nimic despre HTTP; doar acest handler face legătura.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({ProjectNotFoundException.class, RoomNotFoundException.class, ItemNotFoundException.class,
            ComparisonGroupNotFoundException.class, OfferNotFoundException.class, InvalidInviteCodeException.class,
            InspirationImageNotFoundException.class})
    public ProblemDetail handleNotFound(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler({DuplicateUsernameException.class, DuplicateEmailException.class})
    public ProblemDetail handleDuplicateUsername(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidRefreshTokenException.class})
    public ProblemDetail handleAuthenticationFailure(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    /** SEC-7: prea multe eșecuri de login pe același username — 429, consecvent cu rate limiter-ul per-IP. */
    @ExceptionHandler(AccountLockedException.class)
    public ProblemDetail handleAccountLocked(AccountLockedException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    }

    @ExceptionHandler({InvalidRegistrationException.class, InvalidPasswordResetTokenException.class})
    public ProblemDetail handleInvalidRegistration(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Orice altă {@link DomainException} necunoscută aici = regulă de business încălcată, nu 404. */
    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomainException(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    /**
     * Enum necunoscut la deserializare (ex. status="Cumparat" fără diacritice) — payload invalid, nu regulă
     * de business. SEC-5 (docs/tickete-audit-calcule-securitate.md): mesajul original al excepției (poate
     * conține nume de clase/detalii interne din Jackson/librării) NU pleacă spre client — doar loghem-ul
     * server-side, ca să nu scurgem detalii de implementare printr-un 400 „prietenos" în aparență.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        log.info("IllegalArgumentException tradusă în 400: {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Valoare invalidă în cerere");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Payload invalid");
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fieldErrors.put(fe.getField(), fe.getDefaultMessage()));
        problem.setProperty("fieldErrors", fieldErrors);
        return problem;
    }

    /** Sursa externă (BNR) indisponibilă și fără cache să servim în loc — 502, nu 500 (nu e o eroare a noastră). */
    @ExceptionHandler(ExchangeRateFetchException.class)
    public ProblemDetail handleExchangeRateFetchFailure(ExchangeRateFetchException ex) {
        log.warn("Preluarea cursului valutar a eșuat fără cache disponibil", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, "Cursul valutar automat nu e disponibil momentan — introdu-l manual.");
    }

    /**
     * Apărare în adâncime: o constrângere DB încălcată (NOT NULL/FK/UNIQUE) care a scăpat de validarea
     * de la margine — nu trebuie să iasă niciodată ca 500 brut cu stack trace către client.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Datele încalcă o constrângere a bazei de date");
    }
}
