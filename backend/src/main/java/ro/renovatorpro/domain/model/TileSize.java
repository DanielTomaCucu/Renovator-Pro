package ro.renovatorpro.domain.model;

/** Dimensiunea plăcilor de pardoseală/faianță — influențează pierderea estimată la tăiere. */
public enum TileSize {
    MICA("Mică (sub 20×20 cm)"),
    MEDIE("Medie (20×20 – 45×45 cm)"),
    MARE("Mare (60×60 – 60×120 cm)"),
    FOARTE_MARE("Foarte mare (>120 cm pe o latură)");

    private final String label;

    TileSize(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static TileSize fromLabel(String label) {
        for (TileSize t : values()) {
            if (t.label.equals(label)) return t;
        }
        throw new IllegalArgumentException("TileSize necunoscut: " + label);
    }
}
