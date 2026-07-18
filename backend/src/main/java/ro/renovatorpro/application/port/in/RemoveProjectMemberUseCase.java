package ro.renovatorpro.application.port.in;

public interface RemoveProjectMemberUseCase {

    /** Doar OWNER; OWNER nu se poate șterge pe sine (IllegalArgumentException → 400). */
    void execute(String currentUserId, String projectId, String targetUserId);
}
