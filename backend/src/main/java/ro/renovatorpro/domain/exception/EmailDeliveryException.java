package ro.renovatorpro.domain.exception;

/** Eșec infrastructural la trimiterea unui email (Resend indisponibil etc.) — mapat implicit la 500, nu e o regulă de business. */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
