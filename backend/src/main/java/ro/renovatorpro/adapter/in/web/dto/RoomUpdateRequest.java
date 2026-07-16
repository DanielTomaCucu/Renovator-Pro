package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import org.openapitools.jackson.nullable.JsonNullable;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Oglindă a `Partial<Room>`. {@code type}/{@code name}/{@code allocatedBudget}: câmp {@code null} = nu se
 * modifică (obligatorii pe Room, nu pot fi șterse). Restul (câmpuri tehnice OPȚIONALE): {@link JsonNullable}
 * — distinge cheie ABSENTĂ din JSON (nu se modifică) de cheie prezentă cu valoare {@code null} (șterge
 * explicit) — Problema 6 din audit. Necesită {@code JsonNullableModule} înregistrat (vezi config).
 */
public record RoomUpdateRequest(
        String type,
        String name,
        @DecimalMin(value = "0.00", message = "Bugetul alocat nu poate fi negativ") BigDecimal allocatedBudget,
        JsonNullable<String> floorMaterial,
        JsonNullable<Double> floorArea,
        JsonNullable<Double> perimeter,
        JsonNullable<String> tileSize,
        JsonNullable<String> installationType,
        JsonNullable<Map<String, RoomDoorDto>> doors,
        JsonNullable<Double> baseboardHeight,
        JsonNullable<String> wallShape,
        JsonNullable<WallTilingDto> wallTiling,
        JsonNullable<WallFinishDto> wallFinish,
        JsonNullable<Map<String, RoomWindowDto>> windows
) {
}
