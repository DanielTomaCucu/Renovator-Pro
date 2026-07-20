package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Map;

/** Oglindă a `Omit<Room, "id" | "projectId">` — câmpurile tehnice sunt opționale (vezi api-contract.md). */
public record RoomCreateRequest(
        @NotBlank(message = "Tipul camerei este obligatoriu") String type,
        @NotBlank(message = "Numele camerei este obligatoriu") String name,
        @NotNull @DecimalMin(value = "0.00", message = "Bugetul alocat nu poate fi negativ") BigDecimal allocatedBudget,
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
        Map<String, RoomWindowDto> windows,
        Boolean ceilingPaint,
        Boolean underfloorHeating
) {
}
