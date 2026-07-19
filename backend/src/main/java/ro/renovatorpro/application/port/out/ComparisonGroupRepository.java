package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.ComparisonGroup;

import java.util.List;
import java.util.Optional;

public interface ComparisonGroupRepository {

    Optional<ComparisonGroup> findById(String id);

    List<ComparisonGroup> findByRoomId(String roomId);

    List<ComparisonGroup> findByRoomIds(List<String> roomIds);

    ComparisonGroup save(ComparisonGroup group);

    void deleteById(String id);

    /** Cascade explicit la ștergerea unei camere — regulă de business, nu doar constrângere de schemă (ca la Item). */
    void deleteByRoomId(String roomId);
}
