package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Offer;

import java.math.BigDecimal;
import java.util.List;

public interface UpdateOfferUseCase {

    Offer execute(String currentUserId, String offerId, Command command);

    /**
     * Toate câmpurile prin {@link Patch} — {@code absent()} = nu se modifică, {@code of(null)} = șterge
     * explicit (ex. userul golește prețul dintr-o ofertă), {@code of(value)} = setează. Necesar fiindcă
     * toate câmpurile ofertei sunt opționale prin design (nu doar „nu completate încă" ca la Room).
     */
    record Command(
            Patch<String> name,
            Patch<String> store,
            Patch<Money> unitPrice,
            Patch<BigDecimal> quantity,
            Patch<String> productUrl,
            Patch<List<String>> images,
            Patch<String> notes
    ) {
    }
}
