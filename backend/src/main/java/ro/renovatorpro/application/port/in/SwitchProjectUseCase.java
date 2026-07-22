package ro.renovatorpro.application.port.in;

/** Comută sesiunea activă pe un alt proiect la care userul e DEJA membru — vezi ListMyProjectsUseCase pt. opțiuni. */
public interface SwitchProjectUseCase {

    /**
     * @param rawCurrentRefreshToken tokenul din cookie-ul cererii curente (poate fi {@code null}) — dacă
     *                                e prezent și valid, se revocă (sesiunea veche pe proiectul vechi moare).
     */
    AuthResult execute(String currentUserId, String rawCurrentRefreshToken, String targetProjectId);
}
