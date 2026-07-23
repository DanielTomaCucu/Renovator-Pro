package ro.renovatorpro.application.port.in;

public interface ResetPasswordUseCase {

    /** La succes, revocă TOATE sesiunile active ale userului (SessionIssuer nu mai e apelat aici — userul se re-loghează). */
    void execute(String rawToken, String newPassword);
}
