package ro.renovatorpro.config;

import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Înregistrează {@link JsonNullableModule} pe {@code ObjectMapper}-ul implicit (Spring Boot detectează
 * automat orice bean de tip {@code com.fasterxml.jackson.databind.Module}) — necesar ca {@code JsonNullable}
 * din DTO-uri (ex. {@code RoomUpdateRequest}) să distingă „câmp absent" de „câmp prezent cu valoare null"
 * la deserializare (Problema 6 din audit — PATCH care poate ȘTERGE explicit un câmp opțional).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public JsonNullableModule jsonNullableModule() {
        return new JsonNullableModule();
    }
}
