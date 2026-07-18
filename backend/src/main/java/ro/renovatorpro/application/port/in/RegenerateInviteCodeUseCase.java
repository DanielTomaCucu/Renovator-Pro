package ro.renovatorpro.application.port.in;

public interface RegenerateInviteCodeUseCase {

    /** Codul vechi devine imediat invalid; nu afectează membrii deja alăturați. Doar OWNER. */
    String execute(String currentUserId, String projectId);
}
