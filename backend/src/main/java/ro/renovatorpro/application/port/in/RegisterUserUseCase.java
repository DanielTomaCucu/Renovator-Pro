package ro.renovatorpro.application.port.in;

public interface RegisterUserUseCase {

    /** Exact unul din {@code projectName}/{@code inviteCode} trebuie completat (D6) — validat în service. */
    AuthResult execute(Command command);

    record Command(String username, String password, String projectName, String inviteCode) {
    }
}
