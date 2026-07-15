package ro.renovatorpro.adapter.in.web.dto;

import java.util.Map;

/** {@code finishes}: valoare = WallFinishType.label() ("Vopsea"/"Tapet"). */
public record WallFinishDto(Double wallHeight, Map<String, Double> wallLengths, Map<String, String> finishes) {
}
