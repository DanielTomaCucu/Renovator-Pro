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
import java.util.concurrent.atomic.AtomicLong;

/**
 * Rate limiting anti brute-force pe {@code /api/auth/**} (blueprint §5) — fereastră glisantă în memorie,
 * per IP. LIMITARE CUNOSCUTĂ: stare doar în procesul curent, nu se sincronizează între instanțe multiple —
 * suficient pe Render free tier (o singură instanță); dacă aplicația ajunge multi-instanță, mută starea
 * într-un store partajat (Redis) sau adoptă Bucket4j cu backend distribuit. Praguri configurabile
 * (implicit 10/min) — testele de integrare relaxează limita în {@code src/test/resources/application.yml},
 * altfel fluxurile de test cu multe register/login din același „IP" (localhost) s-ar auto-bloca.
 *
 * <p><b>SEC-1 (docs/tickete-audit-calcule-securitate.md):</b> {@code X-Forwarded-For} e populat de
 * proxy-uri, dar clientul poate trimite propria valoare inițială — un atacator poate falsifica primul
 * element din listă la fiecare cerere ca să ocolească limita (fiecare „IP" fals primește propria
 * fereastră) și, în același timp, să umple memoria cu chei noi nelimitat. Render adaugă IP-ul real al
 * clientului ca ULTIM element din listă (singurul hop de proxy de încredere) — folosim acela, nu primul.
 * În plus, harta e curățată periodic de intrările complet expirate, ca să nu crească nelimitat.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    /** După câte cereri se face o curățare completă a hărții — echilibru între cost și creștere de memorie. */
    private static final long CLEANUP_EVERY_N_REQUESTS = 500;

    private final int maxRequestsPerWindow;
    private final Duration window;

    private final Map<String, Deque<Instant>> requestTimestampsByIp = new ConcurrentHashMap<>();
    private final AtomicLong requestCounter = new AtomicLong();

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
            trimExpired(timestamps, now);
            if (timestamps.size() >= maxRequestsPerWindow) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"detail\":\"Prea multe cereri — încearcă din nou peste un minut\"}");
                return;
            }
            timestamps.addLast(now);
        }

        if (requestCounter.incrementAndGet() % CLEANUP_EVERY_N_REQUESTS == 0) {
            cleanupFullyExpiredEntries(now);
        }

        filterChain.doFilter(request, response);
    }

    private void trimExpired(Deque<Instant> timestamps, Instant now) {
        while (!timestamps.isEmpty() && Duration.between(timestamps.peekFirst(), now).compareTo(window) > 0) {
            timestamps.pollFirst();
        }
    }

    /** Elimină din hartă IP-urile a căror ultimă cerere a ieșit deja din fereastră — apărare împotriva creșterii nelimitate de memorie. */
    private void cleanupFullyExpiredEntries(Instant now) {
        requestTimestampsByIp.entrySet().removeIf(entry -> {
            Deque<Instant> timestamps = entry.getValue();
            synchronized (timestamps) {
                trimExpired(timestamps, now);
                return timestamps.isEmpty();
            }
        });
    }

    /**
     * IP-ul real al clientului. Pe Render, cererea trece printr-un singur proxy de încredere care adaugă
     * IP-ul clientului ca ULTIM element din {@code X-Forwarded-For} — clientul poate falsifica orice
     * altceva pune înaintea lui, dar nu poate scrie după propriul hop (proxy-ul adaugă valoarea, nu o
     * citește de la client). Folosim deci ultimul element, nu primul (SEC-1).
     */
    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return request.getRemoteAddr();
        }
        String[] parts = forwardedFor.split(",");
        return parts[parts.length - 1].trim();
    }
}
