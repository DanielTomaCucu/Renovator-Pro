package ro.renovatorpro.domain.model;

/** Proveniența unui element: introdus manual, generat automat din „Configurare Apartament", sau creat din Comparatorul de Oferte. */
public enum ItemOrigin {
    MANUAL("Manual"),
    CONFIGURARE("Din Configurare"),
    COMPARATOR("Din Comparator");

    private final String label;

    ItemOrigin(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static ItemOrigin fromLabel(String label) {
        for (ItemOrigin o : values()) {
            if (o.label.equals(label)) return o;
        }
        throw new IllegalArgumentException("ItemOrigin necunoscut: " + label);
    }
}
