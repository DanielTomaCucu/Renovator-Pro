package ro.renovatorpro.application.port.in;

public interface RefreshTokenUseCase {

    /** Rotire (blueprint §5): tokenul folosit se revocă înainte de a emite unul nou. */
    AuthResult execute(String rawRefreshToken);
}
