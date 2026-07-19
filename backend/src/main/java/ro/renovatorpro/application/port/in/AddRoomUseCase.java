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

public interface AddRoomUseCase {

    /**
     * Creează o cameră. Oglindă a {@code Omit<Room, "id" | "projectId">} din api-contract.md — câmpurile
     * tehnice sunt opționale (fluxul real din UI le lasă {@code null} la creare, adăugându-le ulterior
     * prin {@link UpdateRoomUseCase}, ca în RoomFormDrawer → Configurare Apartament, dar API-ul le acceptă
     * și direct la creare, dacă un client viitor le furnizează).
     */
    Room execute(String currentUserId, String projectId, Command command);

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
            Map<Wall, RoomWindow> windows,
            Boolean ceilingPaint,
            Boolean underfloorHeating
    ) {
    }
}
