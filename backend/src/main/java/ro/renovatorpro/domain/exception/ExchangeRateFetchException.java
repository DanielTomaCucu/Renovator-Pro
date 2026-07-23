package ro.renovatorpro.domain.exception;

/** Eșec infrastructural la preluarea cursului valutar de la sursa externă (BNR indisponibil etc.) — mapat implicit la 502, nu e o regulă de business. */
public class ExchangeRateFetchException extends RuntimeException {

    public ExchangeRateFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
