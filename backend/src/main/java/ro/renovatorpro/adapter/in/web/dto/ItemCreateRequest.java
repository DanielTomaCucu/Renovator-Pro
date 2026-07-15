package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Oglindă a `Omit<Item, "id">`. */
public record ItemCreateRequest(
        @NotBlank(message = "roomId este obligatoriu") String roomId,
        @NotBlank(message = "Numele elementului este obligatoriu") String name,
        @NotBlank(message = "Tipul de material este obligatoriu") String materialType,
        String source,
        @NotBlank(message = "Statusul este obligatoriu") String status,
        @NotNull @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity,
        @NotNull @DecimalMin(value = "0.00", message = "Prețul unitar nu poate fi negativ") BigDecimal unitPrice,
        String productUrl,
        String imageUrl,
        @NotBlank(message = "Proveniența este obligatorie") String origin
) {
}
