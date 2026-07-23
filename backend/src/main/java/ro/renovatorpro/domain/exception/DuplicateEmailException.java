package ro.renovatorpro.domain.exception;

public class DuplicateEmailException extends DomainException {

    public DuplicateEmailException(String email) {
        super("Adresa de email este deja folosită: " + email);
    }
}
