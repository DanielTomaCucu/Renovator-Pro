package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record ChooseOfferRequest(
        @NotBlank(message = "offerId este obligatoriu") String offerId,
        @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity
) {
}
