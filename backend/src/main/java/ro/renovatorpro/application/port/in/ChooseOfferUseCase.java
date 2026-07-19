package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Offer;

import java.math.BigDecimal;
import java.util.List;

public interface ChooseOfferUseCase {

    /**
     * Alege o ofertă a grupului: creează un {@link Item} în camera grupului (origin „Din Comparator") și
     * marchează grupul „Decis". Re-alegerea pe un grup deja Decis creează UN NOU item și suprascrie
     * {@code chosenOfferId}/{@code createdItemId} — nu șterge itemul vechi (userul îl șterge manual).
     */
    Result execute(String currentUserId, String groupId, Command command);

    /** {@code quantity} — dacă absentă, se folosește {@code offer.quantity()}, apoi 1 ca ultim fallback. */
    record Command(String offerId, BigDecimal quantity) {
    }

    /** {@code offers} — ofertele grupului, nemodificate de alegere (răspuns complet, ca la update). */
    record Result(ComparisonGroup group, List<Offer> offers, Item item) {
    }
}
