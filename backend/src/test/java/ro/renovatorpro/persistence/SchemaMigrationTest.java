package ro.renovatorpro.persistence;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifică pe un Postgres REAL (Testcontainers, nu H2) că: contextul Spring pornește și migrarea
 * Flyway V1 s-a aplicat, creând tabelele de bază.
 *
 * <p>{@code disabledWithoutDocker = true} → clasa e dezactivată automat pe mașini fără Docker
 * (contextul Spring nici nu pornește). Rulează în CI, unde Docker e disponibil (vezi Faza 7).
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class SchemaMigrationTest {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void migrareaV1SeAplicaSiCreeazaTabelele() {
        Integer applied = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '1' AND success = true",
                Integer.class);
        assertThat(applied).isEqualTo(1);

        for (String table : new String[]{"users", "projects", "project_members", "rooms", "items"}) {
            Integer exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
                    Integer.class, table);
            assertThat(exists).as("tabelul %s există", table).isEqualTo(1);
        }
    }
}
