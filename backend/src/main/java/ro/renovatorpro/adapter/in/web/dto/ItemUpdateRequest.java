package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

/** Oglindă a `Partial<Item>` — câmp {@code null} = nu se modifică. {@code origin} lipsește intenționat (vezi UpdateItemUseCase). */
public record ItemUpdateRequest(
        String name,
        String materialType,
        String source,
        String status,
        @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity,
        @DecimalMin(value = "0.00", message = "Prețul unitar nu poate fi negativ") BigDecimal unitPrice,
        String productUrl,
        String imageUrl
) {
}
