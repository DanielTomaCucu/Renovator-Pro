package ro.renovatorpro.application.port.out;

import java.time.Instant;

/** Momentul curent — port separat (nu {@code Instant.now()} direct în use case) ca testele să poată fixa timpul. */
public interface TimeProvider {

    Instant now();
}
