package ro.renovatorpro.domain.model;

/** Modul de montaj al pardoselii/plăcilor. */
public enum InstallationType {
    DREPT("Drept"),
    DIAGONAL("Diagonal"),
    HERRINGBONE("Herringbone");

    private final String label;

    InstallationType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static InstallationType fromLabel(String label) {
        for (InstallationType i : values()) {
            if (i.label.equals(label)) return i;
        }
        throw new IllegalArgumentException("InstallationType necunoscut: " + label);
    }
}
