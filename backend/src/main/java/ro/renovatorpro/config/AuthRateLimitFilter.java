package ro.renovatorpro.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Rate limiting anti brute-force pe {@code /api/auth/**} (blueprint §5) — fereastră glisantă în memorie,
 * per IP. LIMITARE CUNOSCUTĂ: stare doar în procesul curent, nu se sincronizează între instanțe multiple —
 * suficient pe Render free tier (o singură instanță); dacă aplicația ajunge multi-instanță, mută starea
 * într-un store partajat (Redis) sau adoptă Bucket4j cu backend distribuit. Praguri configurabile
 * (implicit 10/min) — testele de integrare relaxează limita în {@code src/test/resources/application.yml},
 * altfel fluxurile de test cu multe register/login din același „IP" (localhost) s-ar auto-bloca.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final int maxRequestsPerWindow;
    private final Duration window;

    private final Map<String, Deque<Instant>> requestTimestampsByIp = new ConcurrentHashMap<>();

    public AuthRateLimitFilter(
            @Value("${app.auth.rate-limit.max-requests:10}") int maxRequestsPerWindow,
            @Value("${app.auth.rate-limit.window-seconds:60}") long windowSeconds) {
        this.maxRequestsPerWindow = maxRequestsPerWindow;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = clientIp(request);
        Deque<Instant> timestamps = requestTimestampsByIp.computeIfAbsent(clientIp, key -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && Duration.between(timestamps.peekFirst(), now).compareTo(window) > 0) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxRequestsPerWindow) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"detail\":\"Prea multe cereri — încearcă din nou peste un minut\"}");
                return;
            }
            timestamps.addLast(now);
        }
        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        return forwardedFor != null ? forwardedFor.split(",")[0].trim() : request.getRemoteAddr();
    }
}
