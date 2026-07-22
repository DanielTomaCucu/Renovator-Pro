package ro.renovatorpro.adapter.in.web.dto;

/**
 * ⚠️ Mod dev: {@code resetToken} pleacă direct în răspuns (frontend-ul construiește linkul din el) — NU
 * există serviciu de email configurat. Într-un flux real de producție acest câmp NU ar exista, tokenul ar
 * pleca doar prin email, iar răspunsul ar fi uniform (vezi {@code PasswordResetAccountNotFoundException}).
 */
public record ForgotPasswordResponse(String resetToken) {
}
