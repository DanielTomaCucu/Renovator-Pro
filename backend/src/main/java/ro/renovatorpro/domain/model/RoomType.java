package ro.renovatorpro.domain.model;

/** Tipurile de cameră disponibile la adăugarea unei camere noi. */
public enum RoomType {
    DORMITOR("Dormitor"),
    BAIE("Baie"),
    LIVING("Living"),
    BUCATARIE("Bucătărie"),
    TERASA("Terasă"),
    BALCON("Balcon");

    private final String label;

    RoomType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static RoomType fromLabel(String label) {
        for (RoomType t : values()) {
            if (t.label.equals(label)) return t;
        }
        throw new IllegalArgumentException("RoomType necunoscut: " + label);
    }
}
