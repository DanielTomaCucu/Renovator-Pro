package ro.renovatorpro.application.port.out;

/** Hash-ul (nereversibil) stocat pentru refresh tokens — valoarea în clar nu ajunge niciodată în DB. */
public interface TokenHasher {

    String hash(String rawToken);
}
