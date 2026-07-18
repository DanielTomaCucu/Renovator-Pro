package ro.renovatorpro.application.port.out;

/** Valoarea opacă în clar a unui refresh token (≥ 256 biți), înainte de hash-uire pentru stocare. */
public interface SecureTokenGenerator {

    String generate();
}
