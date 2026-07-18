package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.LoginUseCase;
import ro.renovatorpro.application.port.out.PasswordHasher;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.LoginLockoutGuard;
import ro.renovatorpro.application.security.SessionIssuer;
import ro.renovatorpro.domain.exception.InvalidCredentialsException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.User;

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginService implements LoginUseCase {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PasswordHasher passwordHasher;
    private final SessionIssuer sessionIssuer;
    private final LoginLockoutGuard loginLockoutGuard;

    @Override
    @Transactional
    public AuthResult execute(Command command) {
        // Username-ul e normalizat la lowercase la register (RegisterUserService) — normalizarea
        // trebuie să fie identică aici, altfel un username cu majuscule nu se mai poate loga.
        String normalizedUsername = command.username().trim().toLowerCase(Locale.ROOT);
        // SEC-7: verificat ÎNAINTE de a atinge parola/DB-ul — completează rate limiter-ul per-IP cu unul
        // per-username (un atacant distribuit pe mai multe IP-uri tot lovește același cont).
        loginLockoutGuard.checkNotLocked(normalizedUsername);

        Optional<User> maybeUser = userRepository.findByUsername(normalizedUsername);
        if (maybeUser.isEmpty() || !passwordHasher.matches(command.password(), maybeUser.get().passwordHash())) {
            // Eșec tratat identic pt. „user inexistent" și „parolă greșită" — nu confirmăm existența contului.
            loginLockoutGuard.recordFailure(normalizedUsername);
            throw new InvalidCredentialsException();
        }
        User user = maybeUser.get();
        // Membership, nu ownership (D6/D7): un EDITOR alăturat printr-un cod trebuie să primească
        // proiectul la care s-a alăturat, nu unul deținut de el (nu deține niciunul).
        ProjectMember membership = projectMemberRepository.findByUserId(user.id())
                .orElseThrow(InvalidCredentialsException::new);
        Project project = projectRepository.findById(membership.projectId())
                .orElseThrow(() -> new ProjectNotFoundException(membership.projectId()));
        loginLockoutGuard.recordSuccess(normalizedUsername);
        return sessionIssuer.issue(user, project, membership.role());
    }
}
