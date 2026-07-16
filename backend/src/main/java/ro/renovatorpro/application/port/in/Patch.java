package ro.renovatorpro.application.port.in;

import java.util.Objects;

/**
 * Distinge „câmp absent" (nu se modifică) de „câmp prezent, eventual null" (setează sau ȘTERGE explicit)
 * într-un PATCH — complement la convenția „null = nu se modifică" folosită de restul Command-urilor din
 * aplicație. Necesar doar acolo unde un câmp OPȚIONAL al domeniului trebuie să poată fi șters explicit
 * prin PATCH (Problema 6 din audit: dezactivarea placării/finisajului de pereți nu se persista, fiindcă
 * un câmp absent din JSON și unul trimis explicit `null` erau indistinguibile).
 *
 * <p>Rămâne independent de orice tip de adapter (ex. {@code JsonNullable} de la Jackson) — conversia
 * JSON → {@code Patch} se face în {@code adapter.in.web.mapper.DtoConversionSupport}.
 */
public final class Patch<T> {

    private static final Patch<?> ABSENT = new Patch<>(false, null);

    private final boolean present;
    private final T value;

    private Patch(boolean present, T value) {
        this.present = present;
        this.value = value;
    }

    @SuppressWarnings("unchecked")
    public static <T> Patch<T> absent() {
        return (Patch<T>) ABSENT;
    }

    /** {@code value} poate fi {@code null} — înseamnă „șterge explicit" la {@link #resolve}. */
    public static <T> Patch<T> of(T value) {
        return new Patch<>(true, value);
    }

    public boolean isPresent() {
        return present;
    }

    /** Aplică patch-ul peste o valoare existentă: absent → păstrează neschimbat; prezent → înlocuiește (poate fi null). */
    public T resolve(T existing) {
        return present ? value : existing;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Patch<?> other)) return false;
        return present == other.present && Objects.equals(value, other.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(present, value);
    }

    @Override
    public String toString() {
        return present ? "Patch.of(" + value + ")" : "Patch.absent()";
    }
}
