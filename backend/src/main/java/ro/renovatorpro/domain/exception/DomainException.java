package ro.renovatorpro.domain.exception;

/** Rădăcina excepțiilor de business ale domeniului. Fără dependențe de framework (se mapează la HTTP în adapterul web, Faza 4). */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }
}
