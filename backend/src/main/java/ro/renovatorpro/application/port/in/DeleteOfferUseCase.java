package ro.renovatorpro.application.port.in;

public interface DeleteOfferUseCase {

    /** Dacă oferta era {@code chosenOfferId} a grupului, referința devine {@code null} (statusul rămâne Decis). */
    void execute(String currentUserId, String offerId);
}
