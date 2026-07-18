package ro.renovatorpro.application.port.in;

public interface LogoutUseCase {

    void execute(String rawRefreshToken);
}
