package ro.renovatorpro.application.port.in;

public interface GetInviteCodeUseCase {

    /** Generează leneș la prima cerere (D6) — doar OWNER; altfel 404 (vezi MembershipGuard). */
    String execute(String currentUserId, String projectId);
}
