package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;

public interface AddRoomUseCase {

    /**
     * Creează o cameră cu datele de bază (fără configurare tehnică — aceea se adaugă ulterior prin
     * {@link UpdateRoomUseCase}, ca în fluxul real: RoomFormDrawer → Configurare Apartament).
     */
    Room execute(String currentUserId, String projectId, Command command);

    record Command(RoomType type, String name, Money allocatedBudget) {
    }
}
