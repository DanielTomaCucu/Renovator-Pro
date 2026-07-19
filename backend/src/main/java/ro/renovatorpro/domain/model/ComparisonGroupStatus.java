package ro.renovatorpro.domain.model;

/** Starea unui grup de comparație: în analiză (oferte adunate, nicio decizie) sau decis (ofertă aleasă → element creat). */
public enum ComparisonGroupStatus {
    IN_ANALIZA("În analiză"),
    DECIS("Decis");

    private final String label;

    ComparisonGroupStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static ComparisonGroupStatus fromLabel(String label) {
        for (ComparisonGroupStatus s : values()) {
            if (s.label.equals(label)) return s;
        }
        throw new IllegalArgumentException("ComparisonGroupStatus necunoscut: " + label);
    }
}
