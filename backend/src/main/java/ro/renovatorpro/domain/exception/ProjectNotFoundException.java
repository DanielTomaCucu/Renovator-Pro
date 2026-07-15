package ro.renovatorpro.domain.exception;

public class ProjectNotFoundException extends DomainException {

    public ProjectNotFoundException(String id) {
        super("Proiectul nu a fost găsit: " + id);
    }
}
