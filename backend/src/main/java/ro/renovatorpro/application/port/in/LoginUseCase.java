package ro.renovatorpro.application.port.in;

public interface LoginUseCase {

    AuthResult execute(Command command);

    record Command(String username, String password) {
    }
}
