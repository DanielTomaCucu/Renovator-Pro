package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.InspirationType;

public interface UpdateInspirationImageUseCase {

    InspirationImage execute(String currentUserId, String id, Command command);

    /** {@code roomId}: {@code of(null)} = mută poza la „General". {@code image} nu se poate șterge explicit (rămâne mereu o poză). */
    record Command(
            Patch<String> roomId,
            Patch<InspirationType> type,
            Patch<String> image,
            Patch<String> caption,
            Patch<String> sourceUrl
    ) {
    }
}
