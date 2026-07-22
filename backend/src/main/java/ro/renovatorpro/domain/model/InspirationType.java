package ro.renovatorpro.domain.model;

/** Tipul unei poze din Galeria de Inspirație: făcută de user, randare tehnică, sau preluată din altă sursă (Pinterest etc.). */
public enum InspirationType {
    POZA_PROPRIE("Poză Proprie"),
    RANDARE("Randare"),
    INSPIRATIE_ONLINE("Inspirație Online");

    private final String label;

    InspirationType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static InspirationType fromLabel(String label) {
        for (InspirationType t : values()) {
            if (t.label.equals(label)) return t;
        }
        throw new IllegalArgumentException("InspirationType necunoscut: " + label);
    }
}
