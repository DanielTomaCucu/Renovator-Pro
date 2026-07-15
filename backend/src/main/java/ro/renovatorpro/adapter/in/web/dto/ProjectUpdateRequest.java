package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Oglindă a `Partial<Project>` — câmp {@code null} = nu se modifică; constrângerile se aplică DOAR când câmpul e prezent. */
public record ProjectUpdateRequest(
        @Size(min = 1, max = 200) String title,
        @DecimalMin(value = "0.00", message = "Bugetul total nu poate fi negativ") BigDecimal totalBudget,
        String currency,
        @DecimalMin(value = "0.0", message = "Suprafața nu poate fi negativă") Double totalArea
) {
}
