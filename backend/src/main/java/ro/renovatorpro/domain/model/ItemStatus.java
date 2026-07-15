package ro.renovatorpro.domain.model;

/** Statusul unui element de cumpărat. Doar Cumparat contează la totalul cheltuit (vezi domain.service, Faza 2). */
public enum ItemStatus {
    IN_ASTEPTARE("În așteptare"),
    PLANIFICAT("Planificat"),
    CUMPARAT("Cumpărat");

    private final String label;

    ItemStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static ItemStatus fromLabel(String label) {
        for (ItemStatus s : values()) {
            if (s.label.equals(label)) return s;
        }
        throw new IllegalArgumentException("ItemStatus necunoscut: " + label);
    }
}
