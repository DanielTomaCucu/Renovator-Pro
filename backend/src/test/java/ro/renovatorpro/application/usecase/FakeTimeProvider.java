package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.TimeProvider;

import java.time.Instant;

/** Fake cu timp fixabil manual — pentru teste de use case care verifică createdAt/purchasedAt. */
class FakeTimeProvider implements TimeProvider {

    private Instant current = Instant.parse("2026-01-01T00:00:00Z");

    void set(Instant instant) {
        this.current = instant;
    }

    @Override
    public Instant now() {
        return current;
    }
}
