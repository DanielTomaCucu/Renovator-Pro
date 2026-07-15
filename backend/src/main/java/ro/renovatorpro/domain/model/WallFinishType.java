package ro.renovatorpro.domain.model;

/** Finisajul unui perete la camerele cu parchet/mochetă (nu au faianță) — ales individual, per perete. */
public enum WallFinishType {
    VOPSEA("Vopsea"),
    TAPET("Tapet");

    private final String label;

    WallFinishType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static WallFinishType fromLabel(String label) {
        for (WallFinishType w : values()) {
            if (w.label.equals(label)) return w;
        }
        throw new IllegalArgumentException("WallFinishType necunoscut: " + label);
    }
}
