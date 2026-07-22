package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.RequestPasswordResetUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.PasswordResetEmailSender;
import ro.renovatorpro.application.port.out.PasswordResetTokenRepository;
import ro.renovatorpro.application.port.out.SecureTokenGenerator;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.model.user.User;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RequestPasswordResetService implements RequestPasswordResetUseCase {

    private static final Logger log = LoggerFactory.getLogger(RequestPasswordResetService.class);
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureTokenGenerator secureTokenGenerator;
    private final TokenHasher tokenHasher;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final PasswordResetEmailSender passwordResetEmailSender;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public void execute(String email) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        Optional<User> user = userRepository.findByEmail(normalized);
        if (user.isEmpty()) {
            // Nu confirmăm existența contului — răspuns identic apelantului indiferent de rezultat.
            log.debug("Cerere de resetare parolă pentru un email inexistent");
            return;
        }

        String rawToken = secureTokenGenerator.generate();
        passwordResetTokenRepository.insert(idGenerator.newId(), user.get().id(), tokenHasher.hash(rawToken),
                timeProvider.now().plus(TOKEN_TTL));

        String resetLink = frontendBaseUrl + "/reset-password?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        passwordResetEmailSender.send(normalized, resetLink);
    }
}
