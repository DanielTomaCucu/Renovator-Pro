package ro.renovatorpro.domain.model;

/** Peretele unei camere, pe puncte cardinale — folosit pentru poziția ușii/ferestrei și placarea pereților. */
public enum Wall {
    NORD("N"),
    EST("E"),
    SUD("S"),
    VEST("V");

    private final String label;

    Wall(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static Wall fromLabel(String label) {
        for (Wall w : values()) {
            if (w.label.equals(label)) return w;
        }
        throw new IllegalArgumentException("Wall necunoscut: " + label);
    }
}
