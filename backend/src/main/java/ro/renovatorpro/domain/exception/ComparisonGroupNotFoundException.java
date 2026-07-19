package ro.renovatorpro.domain.exception;

public class ComparisonGroupNotFoundException extends DomainException {

    public ComparisonGroupNotFoundException(String id) {
        super("Grupul de comparație nu a fost găsit: " + id);
    }
}
