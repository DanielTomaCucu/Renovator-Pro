package ro.renovatorpro.domain.model;

/** Monedele suportate pentru afișarea sumelor unui proiect. Valoare string identică cu enum-ul TS. */
public enum Currency {
    EUR("EUR"),
    RON("RON");

    private final String label;

    Currency(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static Currency fromLabel(String label) {
        for (Currency c : values()) {
            if (c.label.equals(label)) return c;
        }
        throw new IllegalArgumentException("Currency necunoscut: " + label);
    }
}
