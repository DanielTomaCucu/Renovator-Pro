package ro.renovatorpro.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Filter chain stateless JWT (blueprint §5, Faza 5 Task 5.1): public DOAR {@code /api/auth/**} +
 * health + docs API; restul autentificat. Fără sesiune server-side, fără CSRF (API JWT, nu formular
 * cu cookie de sesiune — refresh token-ul e httpOnly dar nu autentifică direct cererile de date).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final Environment environment;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // SEC-3 (docs/tickete-audit-calcule-securitate.md): springdoc e deja dezactivat pe prod prin
        // application.yml, dar apărarea nu trebuie să depindă DOAR de acel flag — dacă cineva activează
        // din greșeală springdoc pe prod, rutele nu mai sunt publice implicit aici.
        boolean isDev = environment.acceptsProfiles(Profiles.of("dev"));
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/api/auth/**", "/actuator/health").permitAll();
                    if (isDev) {
                        auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"detail\":\"Autentificare necesară\"}");
                }))
                .addFilterBefore(authRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Gol intenționat: JwtAuthenticationFilter populează SecurityContext direct din JWT, fără
     * {@code UserDetailsService}. Fără acest bean, Spring Boot auto-configurează unul cu o parolă
     * generată aleator la fiecare pornire (log zgomotos) — niciodată folosită operațional aici.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
