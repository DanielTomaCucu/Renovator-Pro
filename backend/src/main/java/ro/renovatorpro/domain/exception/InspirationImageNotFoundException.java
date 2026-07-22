package ro.renovatorpro.domain.exception;

public class InspirationImageNotFoundException extends DomainException {

    public InspirationImageNotFoundException(String id) {
        super("Poza din galerie nu a fost găsită: " + id);
    }
}
