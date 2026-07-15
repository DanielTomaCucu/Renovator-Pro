package ro.renovatorpro.adapter.in.web;

/**
 * Userul curent e STUB până la Faza 5 (autentificare) — ID fix, seedat în
 * {@code V2__seed_default_project.sql}. Threadat prin use case-uri deja acum (parametru
 * {@code currentUserId}), neutilizat operațional, ca autorizarea să nu fie retrofit.
 */
final class WebConstants {

    static final String STUB_USER_ID = "00000000-0000-0000-0000-000000000001";

    private WebConstants() {
    }
}
