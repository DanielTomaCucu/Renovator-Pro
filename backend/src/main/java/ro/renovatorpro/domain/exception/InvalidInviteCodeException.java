package ro.renovatorpro.domain.exception;

/** Mesaj generic intenționat — nu distinge „cod inexistent" de „cod regenerat între timp" (D6). */
public class InvalidInviteCodeException extends DomainException {

    public InvalidInviteCodeException() {
        super("Cod de invitație invalid");
    }
}
