package ro.renovatorpro.adapter.in.web.dto;

/**
 * Oglindă a {@code Partial<{name, materialType, roomId}>} — câmp {@code null}/absent = nu se modifică.
 * {@code roomId} mută grupul în altă cameră, permis doar cât timp grupul e „În analiză" (400/422 altfel —
 * vezi {@code UpdateComparisonGroupService}).
 */
public record ComparisonGroupUpdateRequest(
        String name,
        String materialType,
        String roomId
) {
}
