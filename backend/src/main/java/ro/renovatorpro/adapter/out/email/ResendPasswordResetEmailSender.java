package ro.renovatorpro.adapter.out.email;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.PasswordResetEmailSender;
import ro.renovatorpro.domain.exception.EmailDeliveryException;

@Component
public class ResendPasswordResetEmailSender implements PasswordResetEmailSender {

    private static final Logger log = LoggerFactory.getLogger(ResendPasswordResetEmailSender.class);

    private final String apiKey;
    private final String fromAddress;

    public ResendPasswordResetEmailSender(
            @Value("${app.email.resend-api-key:}") String apiKey,
            @Value("${app.email.from-address}") String fromAddress) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
    }

    @Override
    public void send(String toEmail, String resetLink) {
        // Fără RESEND_API_KEY (ex. dev local fără cont Resend creat), scriem linkul în log în loc să
        // eșuăm fluxul — comportament echivalent cu vechiul mod dev, dar fără să-l expunem prin API.
        if (apiKey.isBlank()) {
            log.warn("RESEND_API_KEY nesetat — linkul de resetare pentru {} nu a fost trimis pe email: {}",
                    toEmail, resetLink);
            return;
        }

        CreateEmailOptions request = CreateEmailOptions.builder()
                .from(fromAddress)
                .to(toEmail)
                .subject("Resetare parolă — Renovator Pro")
                .html(buildHtml(resetLink))
                .build();

        try {
            new Resend(apiKey).emails().send(request);
        } catch (ResendException e) {
            throw new EmailDeliveryException("Trimiterea emailului de resetare parolă a eșuat", e);
        }
    }

    private static String buildHtml(String resetLink) {
        return """
                <p>Ai cerut resetarea parolei pentru contul Renovator Pro.</p>
                <p><a href="%s">Setează o parolă nouă</a></p>
                <p>Linkul expiră în 30 de minute și poate fi folosit o singură dată. Dacă nu ai cerut tu
                resetarea, poți ignora acest email.</p>
                """.formatted(resetLink);
    }
}
