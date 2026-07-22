package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.InspirationType;

public interface AddInspirationImageUseCase {

    InspirationImage execute(String currentUserId, String projectId, Command command);

    /** {@code roomId} opțional — poză „generală", neasignată unei camere. */
    record Command(
            String roomId,
            InspirationType type,
            String image,
            String caption,
            String sourceUrl
    ) {
    }
}
