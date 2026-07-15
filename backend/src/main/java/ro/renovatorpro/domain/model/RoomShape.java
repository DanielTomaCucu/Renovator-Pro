package ro.renovatorpro.domain.model;

/**
 * Forma geometrică asumată a camerei — determină câte lungimi de perete trebuie completate manual
 * (Pătrat: 1, Dreptunghi: 2, Neregulată: 4). Concern de UI: backend-ul o stochează, nu o validează suplimentar.
 */
public enum RoomShape {
    PATRAT("Pătrat"),
    DREPTUNGHI("Dreptunghi"),
    NEREGULATA("Neregulată");

    private final String label;

    RoomShape(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static RoomShape fromLabel(String label) {
        for (RoomShape s : values()) {
            if (s.label.equals(label)) return s;
        }
        throw new IllegalArgumentException("RoomShape necunoscut: " + label);
    }
}
