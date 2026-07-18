package ro.renovatorpro.domain.exception;

public class DuplicateUsernameException extends DomainException {

    public DuplicateUsernameException(String username) {
        super("Numele de utilizator este deja folosit: " + username);
    }
}
