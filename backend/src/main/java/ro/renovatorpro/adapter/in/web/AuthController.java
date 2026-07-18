package ro.renovatorpro.adapter.in.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.AuthResponse;
import ro.renovatorpro.adapter.in.web.dto.CurrentUserResponse;
import ro.renovatorpro.adapter.in.web.dto.LoginRequest;
import ro.renovatorpro.adapter.in.web.dto.RefreshResponse;
import ro.renovatorpro.adapter.in.web.dto.RegisterRequest;
import ro.renovatorpro.adapter.in.web.mapper.AuthDtoMapper;
import ro.renovatorpro.adapter.in.web.mapper.ProjectDtoMapper;
import ro.renovatorpro.application.port.in.AuthResult;
import ro.renovatorpro.application.port.in.GetCurrentUserUseCase;
import ro.renovatorpro.application.port.in.LoginUseCase;
import ro.renovatorpro.application.port.in.LogoutUseCase;
import ro.renovatorpro.application.port.in.RefreshTokenUseCase;
import ro.renovatorpro.application.port.in.RegisterUserUseCase;

import java.time.Duration;

/** `/api/auth/**` — public (SecurityConfig); restul rutelor cer JWT valid. Vezi docs/cerinte-autentificare.md AUTH-1. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final ProjectDtoMapper projectDtoMapper;
    private final AuthDtoMapper authDtoMapper;

    @Value("${app.auth.refresh-cookie-name}")
    private String refreshCookieName;

    @Value("${app.auth.refresh-token-ttl-days}")
    private long refreshTokenTtlDays;

    @Value("${app.auth.refresh-cookie-same-site}")
    private String refreshCookieSameSite;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        RegisterUserUseCase.Command command = new RegisterUserUseCase.Command(
                request.username(), request.password(), request.projectName(), request.inviteCode());
        AuthResult result = registerUserUseCase.execute(command);
        setRefreshCookie(response, result.refreshToken());
        return toAuthResponse(result);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = loginUseCase.execute(new LoginUseCase.Command(request.username(), request.password()));
        setRefreshCookie(response, result.refreshToken());
        return toAuthResponse(result);
    }

    @PostMapping("/refresh")
    public RefreshResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        AuthResult result = refreshTokenUseCase.execute(readRefreshCookie(request));
        setRefreshCookie(response, result.refreshToken());
        return new RefreshResponse(result.accessToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        logoutUseCase.execute(readRefreshCookie(request));
        clearRefreshCookie(response);
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        GetCurrentUserUseCase.Result result = getCurrentUserUseCase.execute(CurrentUser.id());
        return new CurrentUserResponse(
                authDtoMapper.toUserResponse(result.user()),
                projectDtoMapper.toResponse(result.project()),
                result.role().name());
    }

    private AuthResponse toAuthResponse(AuthResult result) {
        return new AuthResponse(
                result.accessToken(),
                authDtoMapper.toUserResponse(result.user()),
                projectDtoMapper.toResponse(result.project()),
                result.role().name());
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (refreshCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void setRefreshCookie(HttpServletResponse response, String rawRefreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(rawRefreshToken, Duration.ofDays(refreshTokenTtlDays)).toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", Duration.ZERO).toString());
    }

    /**
     * {@code Secure} rămâne activ inclusiv pe dev — Chrome/Firefox tratează {@code http://localhost} ca
     * „context sigur" (excepție documentată), deci cookie-ul tot pleacă în dezvoltare locală.
     */
    private ResponseCookie buildCookie(String value, Duration maxAge) {
        return ResponseCookie.from(refreshCookieName, value)
                .httpOnly(true)
                .secure(true)
                .sameSite(refreshCookieSameSite)
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
    }
}
