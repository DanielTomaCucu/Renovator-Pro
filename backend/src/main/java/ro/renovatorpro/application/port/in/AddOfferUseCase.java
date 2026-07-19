package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Offer;

import java.math.BigDecimal;
import java.util.List;

public interface AddOfferUseCase {

    Offer execute(String currentUserId, String groupId, Command command);

    /** TOATE câmpurile opționale — o ofertă goală (doar poze, sau complet goală) e un rezultat valid. */
    record Command(
            String name,
            String store,
            Money unitPrice,
            BigDecimal quantity,
            String productUrl,
            List<String> images,
            String notes
    ) {
    }
}
