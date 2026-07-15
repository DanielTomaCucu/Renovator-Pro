package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;

public interface AddItemUseCase {

    Item execute(String currentUserId, Command command);

    record Command(
            String roomId,
            String name,
            MaterialType materialType,
            String source,
            ItemStatus status,
            BigDecimal quantity,
            Money unitPrice,
            String productUrl,
            String imageUrl,
            ItemOrigin origin
    ) {
    }
}
