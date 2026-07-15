package ro.renovatorpro.domain.model;

/** Categoria de material/produs a unui element de cumpărat. */
public enum MaterialType {
    GRESIE("Gresie"),
    FAIANTA("Faianță"),
    PLINTA("Plintă"),
    PARCHET("Parchet"),
    VOPSEA("Vopsea"),
    TAPET("Tapet"),
    GLAF_FEREASTRA("Glaf Fereastră"),
    SANITARE("Sanitare"),
    MOBILA("Mobilă"),
    ELECTROCASNICE("Electrocasnice"),
    CORPURI_ILUMINAT("Corpuri de iluminat"),
    ALTELE("Altele");

    private final String label;

    MaterialType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static MaterialType fromLabel(String label) {
        for (MaterialType m : values()) {
            if (m.label.equals(label)) return m;
        }
        throw new IllegalArgumentException("MaterialType necunoscut: " + label);
    }
}
