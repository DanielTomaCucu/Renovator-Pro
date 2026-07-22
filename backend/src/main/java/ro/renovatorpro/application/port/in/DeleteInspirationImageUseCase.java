package ro.renovatorpro.application.port.in;

public interface DeleteInspirationImageUseCase {

    void execute(String currentUserId, String id);
}
