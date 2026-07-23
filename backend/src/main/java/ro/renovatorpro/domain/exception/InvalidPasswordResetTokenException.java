package ro.renovatorpro.domain.exception;

public class InvalidPasswordResetTokenException extends DomainException {

    public InvalidPasswordResetTokenException() {
        super("Link de resetare invalid, expirat sau deja folosit");
    }
}
