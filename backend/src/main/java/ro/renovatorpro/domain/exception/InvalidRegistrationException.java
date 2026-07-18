package ro.renovatorpro.domain.exception;

/** Payload de înregistrare invalid la nivel de business (ex. nici projectName nici inviteCode, sau ambele). */
public class InvalidRegistrationException extends DomainException {

    public InvalidRegistrationException(String message) {
        super(message);
    }
}
