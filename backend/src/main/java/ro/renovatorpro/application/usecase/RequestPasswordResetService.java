package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.RequestPasswordResetUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.PasswordResetTokenRepository;
import ro.renovatorpro.application.port.out.SecureTokenGenerator;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.TokenHasher;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.exception.PasswordResetAccountNotFoundException;
import ro.renovatorpro.domain.model.user.User;

import java.time.Duration;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RequestPasswordResetService implements RequestPasswordResetUseCase {

    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureTokenGenerator secureTokenGenerator;
    private final TokenHasher tokenHasher;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;

    @Override
    @Transactional
    public String execute(String email) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new PasswordResetAccountNotFoundException(normalized));
        String rawToken = secureTokenGenerator.generate();
        passwordResetTokenRepository.insert(idGenerator.newId(), user.id(), tokenHasher.hash(rawToken),
                timeProvider.now().plus(TOKEN_TTL));
        return rawToken;
    }
}
