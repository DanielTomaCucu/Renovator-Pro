package ro.renovatorpro.application.port.in;

/**
 * Alăturarea unui user DEJA autentificat la un alt proiect, via cod de invitație — spre deosebire de
 * {@code RegisterUserUseCase} (calea „mă alătur" era disponibilă doar la înregistrare, D6 original).
 * Idempotent: dacă userul e deja membru al proiectului codului, doar comută sesiunea pe el, fără să
 * creeze o a doua apartenență (ar coliziona pe cheia primară project_id+user_id).
 */
public interface JoinProjectUseCase {

    /** @return o sesiune nouă, activă pe proiectul la care userul tocmai s-a alăturat (sau era deja membru). */
    AuthResult execute(String currentUserId, String inviteCode);
}
