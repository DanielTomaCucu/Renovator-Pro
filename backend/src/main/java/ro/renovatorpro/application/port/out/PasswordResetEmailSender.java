package ro.renovatorpro.application.port.out;

/** Trimite emailul cu linkul de resetare a parolei — implementarea reală vorbește cu Resend. */
public interface PasswordResetEmailSender {

    void send(String toEmail, String resetLink);
}
