package ro.renovatorpro.domain.exception;

/** Mesaj generic intenționat — nu distinge „userul nu există" de „parolă greșită" (nu confirmăm existența contului). */
public class InvalidCredentialsException extends DomainException {

    public InvalidCredentialsException() {
        super("Nume de utilizator sau parolă incorecte");
    }
}
