package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.RegisterUserUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.PasswordHasher;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.SessionIssuer;
import ro.renovatorpro.domain.exception.DuplicateEmailException;
import ro.renovatorpro.domain.exception.DuplicateUsernameException;
import ro.renovatorpro.domain.exception.InvalidInviteCodeException;
import ro.renovatorpro.domain.exception.InvalidRegistrationException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

import java.util.Locale;

/**
 * Register cu DOUĂ căi (D6, docs/cerinte-autentificare.md): „proiect nou" (creează + OWNER) sau
 * „mă alătur" (cod de invitație → EDITOR pe proiectul existent). Calea „proiect nou" adoptă proiectul
 * seed (V2__seed_default_project.sql) dacă e primul cont real din sistem (D3) — altfel creează unul gol.
 */
@Service
@RequiredArgsConstructor
public class RegisterUserService implements RegisterUserUseCase {

    /** Fixate în V2__seed_default_project.sql — după adopție, owner_id nu mai e acesta, deci adopția nu se repetă. */
    private static final String SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
    private static final String SEED_PROJECT_ID = "00000000-0000-0000-0000-000000000010";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PasswordHasher passwordHasher;
    private final SessionIssuer sessionIssuer;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;

    @Override
    @Transactional
    public AuthResult execute(Command command) {
        boolean hasProjectName = command.projectName() != null && !command.projectName().isBlank();
        boolean hasInviteCode = command.inviteCode() != null && !command.inviteCode().isBlank();
        if (hasProjectName == hasInviteCode) {
            throw new InvalidRegistrationException(
                    "Completează fie numele proiectului nou, fie un cod de invitație — nu ambele, nu niciunul");
        }

        String username = command.username().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateUsernameException(username);
        }
        String email = command.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateEmailException(email);
        }

        User user = new User(idGenerator.newId(), username, email, passwordHasher.hash(command.password()), null, timeProvider.now());
        User savedUser = userRepository.insert(user);

        Project project;
        ProjectRole role;
        if (hasInviteCode) {
            String projectId = projectRepository.findProjectIdByInviteCode(command.inviteCode().trim())
                    .orElseThrow(InvalidInviteCodeException::new);
            project = projectRepository.findById(projectId).orElseThrow(() -> new ProjectNotFoundException(projectId));
            role = ProjectRole.EDITOR;
        } else {
            project = resolveOrCreateProject(command.projectName().trim(), savedUser.id());
            role = ProjectRole.OWNER;
        }
        projectMemberRepository.save(new ProjectMember(project.id(), savedUser.id(), role, timeProvider.now()));

        return sessionIssuer.issue(savedUser, project, role);
    }

    /** Adoptă proiectul seed (D3) dacă încă e deținut de userul stub; altfel creează un proiect nou gol. */
    private Project resolveOrCreateProject(String projectName, String newOwnerId) {
        boolean seedIsUnclaimed = projectRepository.findOwnerId(SEED_PROJECT_ID)
                .map(SEED_USER_ID::equals)
                .orElse(false);
        if (seedIsUnclaimed) {
            projectRepository.changeOwner(SEED_PROJECT_ID, newOwnerId);
            Project seed = projectRepository.findById(SEED_PROJECT_ID)
                    .orElseThrow(() -> new ProjectNotFoundException(SEED_PROJECT_ID));
            Project retitled = new Project(seed.id(), projectName, seed.totalBudget(), seed.currency(), seed.totalArea());
            return projectRepository.update(retitled);
        }
        Project fresh = new Project(idGenerator.newId(), projectName, Money.zero(), Currency.EUR, null);
        return projectRepository.insert(fresh, newOwnerId);
    }
}
