package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;

public interface UpdateItemUseCase {

    Item execute(String currentUserId, String itemId, Command command);

    /**
     * Câmp {@code null} = nu se modifică. {@code origin} lipsește intenționat — nu e patchabil de user,
     * distinge Manual/Configurare și rămâne fix după creare (vezi AutoItemReconciler pentru cazul Configurare).
     */
    record Command(
            String name,
            MaterialType materialType,
            String source,
            ItemStatus status,
            BigDecimal quantity,
            Money unitPrice,
            String productUrl,
            String imageUrl
    ) {
    }
}
