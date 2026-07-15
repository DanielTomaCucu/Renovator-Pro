package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.Map;

/** Oglindă a `Partial<Room>` — câmp {@code null} = nu se modifică. */
public record RoomUpdateRequest(
        String type,
        String name,
        @DecimalMin(value = "0.00", message = "Bugetul alocat nu poate fi negativ") BigDecimal allocatedBudget,
        String floorMaterial,
        Double floorArea,
        Double perimeter,
        String tileSize,
        String installationType,
        Map<String, RoomDoorDto> doors,
        Double baseboardHeight,
        String wallShape,
        WallTilingDto wallTiling,
        WallFinishDto wallFinish,
        Map<String, RoomWindowDto> windows
) {
}
