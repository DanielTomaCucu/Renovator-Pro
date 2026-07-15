package ro.renovatorpro.application.port.out;

/** Generare de ID-uri noi — port separat (nu {@code UUID.randomUUID()} direct în use case) ca testele de use case să poată fixa ID-uri predictibile. */
public interface IdGenerator {

    String newId();
}
