package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.Map;

/** Oglindă a `Room` din api-contract.md / Room.ts — enum-urile sunt String, structurile per-perete cu chei String (Wall.label()). */
public record RoomResponse(
        String id,
        String projectId,
        String type,
        String name,
        BigDecimal allocatedBudget,
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
