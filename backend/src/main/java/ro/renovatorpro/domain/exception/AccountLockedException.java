package ro.renovatorpro.domain.exception;

/** Prea multe autentificări eșuate pe același username — cont blocat temporar (SEC-7). */
public class AccountLockedException extends DomainException {

    public AccountLockedException() {
        super("Prea multe încercări eșuate — contul e blocat temporar. Încearcă din nou peste câteva minute.");
    }
}
