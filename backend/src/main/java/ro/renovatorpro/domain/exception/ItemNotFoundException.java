package ro.renovatorpro.domain.exception;

public class ItemNotFoundException extends DomainException {

    public ItemNotFoundException(String id) {
        super("Elementul nu a fost găsit: " + id);
    }
}
