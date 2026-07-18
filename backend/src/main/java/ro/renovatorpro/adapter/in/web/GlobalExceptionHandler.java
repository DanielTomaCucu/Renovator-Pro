package ro.renovatorpro.adapter.in.web;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ro.renovatorpro.domain.exception.DomainException;
import ro.renovatorpro.domain.exception.DuplicateUsernameException;
import ro.renovatorpro.domain.exception.InvalidCredentialsException;
import ro.renovatorpro.domain.exception.InvalidInviteCodeException;
import ro.renovatorpro.domain.exception.InvalidRefreshTokenException;
import ro.renovatorpro.domain.exception.InvalidRegistrationException;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
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

    @ExceptionHandler({ProjectNotFoundException.class, RoomNotFoundException.class, ItemNotFoundException.class,
            InvalidInviteCodeException.class})
    public ProblemDetail handleNotFound(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateUsernameException.class)
    public ProblemDetail handleDuplicateUsername(DuplicateUsernameException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidRefreshTokenException.class})
    public ProblemDetail handleAuthenticationFailure(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(InvalidRegistrationException.class)
    public ProblemDetail handleInvalidRegistration(InvalidRegistrationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Orice altă {@link DomainException} necunoscută aici = regulă de business încălcată, nu 404. */
    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomainException(DomainException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    /** Enum necunoscut la deserializare (ex. status="Cumparat" fără diacritice) — payload invalid, nu regulă de business. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
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

    /**
     * Apărare în adâncime: o constrângere DB încălcată (NOT NULL/FK/UNIQUE) care a scăpat de validarea
     * de la margine — nu trebuie să iasă niciodată ca 500 brut cu stack trace către client.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Datele încalcă o constrângere a bazei de date");
    }
}
