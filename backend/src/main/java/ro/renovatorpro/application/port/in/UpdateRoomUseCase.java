package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.InstallationType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomShape;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.TileSize;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallTiling;

import java.util.Map;

public interface UpdateRoomUseCase {

    /**
     * Actualizează o cameră. Dacă {@link Command#touchesTechnicalFields()} e adevărat, implementarea
     * invocă {@code AutoItemReconciler} după salvare (regulă de business, nu doar persistență).
     */
    Result execute(String currentUserId, String roomId, Command command);

    /** {@code projectId} inclus explicit — necesar pentru {@code RoomResponse} (Faza 4), domeniul nu-l cunoaște. */
    record Result(Room room, String projectId) {
    }

    /** Câmp {@code null} = nu se modifică. Oglindă a {@code Partial<Room>} din TS. */
    record Command(
            RoomType type,
            String name,
            Money allocatedBudget,
            FlooringType floorMaterial,
            Double floorArea,
            Double perimeter,
            TileSize tileSize,
            InstallationType installationType,
            Map<Wall, RoomDoor> doors,
            Double baseboardHeight,
            RoomShape wallShape,
            WallTiling wallTiling,
            WallFinish wallFinish,
            Map<Wall, RoomWindow> windows
    ) {
        /** true dacă patch-ul atinge orice câmp de configurare tehnică — declanșează reconcilierea elementelor auto-generate. */
        public boolean touchesTechnicalFields() {
            return floorMaterial != null || floorArea != null || perimeter != null || tileSize != null
                    || installationType != null || doors != null || baseboardHeight != null
                    || wallShape != null || wallTiling != null || wallFinish != null || windows != null;
        }
    }
}
