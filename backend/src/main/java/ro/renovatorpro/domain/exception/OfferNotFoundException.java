package ro.renovatorpro.domain.exception;

public class OfferNotFoundException extends DomainException {

    public OfferNotFoundException(String id) {
        super("Oferta nu a fost găsită: " + id);
    }
}
