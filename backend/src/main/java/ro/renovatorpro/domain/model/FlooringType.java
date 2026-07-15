package ro.renovatorpro.domain.model;

/** Tipurile de material de pardoseală disponibile la configurarea tehnică a unei camere. */
public enum FlooringType {
    PARCHET_LAMINAT("Parchet Laminat"),
    GRESIE("Gresie"),
    MOCHETA("Mochetă");

    private final String label;

    FlooringType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static FlooringType fromLabel(String label) {
        for (FlooringType f : values()) {
            if (f.label.equals(label)) return f;
        }
        throw new IllegalArgumentException("FlooringType necunoscut: " + label);
    }
}
