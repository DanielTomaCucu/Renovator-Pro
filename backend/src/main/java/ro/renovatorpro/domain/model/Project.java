package ro.renovatorpro.domain.model;

import java.util.Objects;

/** Proiectul de renovare. `totalArea` (mp, opțional) e introdus manual pentru progresul de proiect. */
public record Project(String id, String title, Money totalBudget, Currency currency, Double totalArea) {

    public Project {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(title, "title");
        Objects.requireNonNull(totalBudget, "totalBudget");
        Objects.requireNonNull(currency, "currency");
        if (title.isBlank()) {
            throw new IllegalArgumentException("Titlul proiectului nu poate fi gol");
        }
    }
}
