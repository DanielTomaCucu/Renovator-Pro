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

    /**
     * {@code type}/{@code name}/{@code allocatedBudget}: {@code null} = nu se modifică (câmpuri
     * obligatorii pe {@link Room}, nu pot fi șterse — convenția veche rămâne valabilă pt. ele).
     * Restul (câmpuri tehnice OPȚIONALE): {@link Patch} — {@code absent()} = nu se modifică,
     * {@code of(null)} = șterge explicit, {@code of(value)} = setează (Problema 6 din audit).
     */
    record Command(
            RoomType type,
            String name,
            Money allocatedBudget,
            Patch<FlooringType> floorMaterial,
            Patch<Double> floorArea,
            Patch<Double> perimeter,
            Patch<TileSize> tileSize,
            Patch<InstallationType> installationType,
            Patch<Map<Wall, RoomDoor>> doors,
            Patch<Double> baseboardHeight,
            Patch<RoomShape> wallShape,
            Patch<WallTiling> wallTiling,
            Patch<WallFinish> wallFinish,
            Patch<Map<Wall, RoomWindow>> windows
    ) {
        /** true dacă patch-ul atinge orice câmp de configurare tehnică — declanșează reconcilierea elementelor auto-generate. */
        public boolean touchesTechnicalFields() {
            return floorMaterial.isPresent() || floorArea.isPresent() || perimeter.isPresent()
                    || tileSize.isPresent() || installationType.isPresent() || doors.isPresent()
                    || baseboardHeight.isPresent() || wallShape.isPresent() || wallTiling.isPresent()
                    || wallFinish.isPresent() || windows.isPresent();
        }
    }
}
