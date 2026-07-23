package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.InspirationImage;

import java.util.List;
import java.util.Optional;

public interface InspirationImageRepository {

    Optional<InspirationImage> findById(String id);

    List<InspirationImage> findByProjectId(String projectId);

    InspirationImage save(InspirationImage image);

    void deleteById(String id);

    /** Dezasignează (NU șterge) pozele unei camere — apelat la ștergerea camerei, vezi {@code DeleteRoomService}. */
    void clearRoomId(String roomId);
}
