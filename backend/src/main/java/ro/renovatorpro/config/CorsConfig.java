package ro.renovatorpro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS allowlist configurabil per profil (Task 4.2, blueprint §Faza 4) — dev: localhost:3001;
 * prod: domeniul Vercel real, din variabilă de mediu (niciodată wildcard `*`).
 * Expus ca {@link CorsConfigurationSource} (nu {@code WebMvcConfigurer.addCorsMappings}) ca Spring
 * Security să-l poată folosi direct în {@link SecurityConfig} — un singur loc de adevăr pentru CORS.
 * {@code allowCredentials(true)} e obligatoriu din Faza 5: cookie-ul de refresh e cross-origin (Vercel → Render).
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
