package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.MaterialType;

public interface AddComparisonGroupUseCase {

    ComparisonGroup execute(String currentUserId, String roomId, Command command);

    record Command(String name, MaterialType materialType) {
    }
}
