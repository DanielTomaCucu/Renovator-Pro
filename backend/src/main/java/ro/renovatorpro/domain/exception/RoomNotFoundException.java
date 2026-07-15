package ro.renovatorpro.domain.exception;

public class RoomNotFoundException extends DomainException {

    public RoomNotFoundException(String id) {
        super("Camera nu a fost găsită: " + id);
    }
}
