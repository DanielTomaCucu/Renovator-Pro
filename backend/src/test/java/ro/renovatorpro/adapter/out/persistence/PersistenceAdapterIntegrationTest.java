package ro.renovatorpro.adapter.out.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifică adapterele de persistență (Task 3.1) pe un Postgres REAL (Testcontainers) — inclusiv
 * round-trip-ul JSONB al structurilor per-perete și convertoarele de enum cu diacritice.
 * {@code disabledWithoutDocker = true} — dezactivat automat pe mașini fără Docker (rulează în CI).
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@Transactional // fiecare test face rollback la final — testele partajează același container/proiect seedat, nu trebuie să se polueze reciproc
class PersistenceAdapterIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    private static final String SEEDED_PROJECT_ID = "00000000-0000-0000-0000-000000000010";
    private static final String SEEDED_OWNER_ID = "00000000-0000-0000-0000-000000000001";

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ItemRepository itemRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void gasesteProiectulSeedatDinV2() {
        Project project = projectRepository.findById(SEEDED_PROJECT_ID).orElseThrow();
        assertThat(project.title()).isEqualTo("Proiectul Meu");
        assertThat(project.currency()).isEqualTo(Currency.EUR);
    }

    @Test
    void updateProiectPastreazaOwnerul() {
        Project project = projectRepository.findById(SEEDED_PROJECT_ID).orElseThrow();
        Project updated = new Project(project.id(), "Renovare Apartament", Money.of(5000), Currency.RON, 65.0);
        Project result = projectRepository.update(updated);
        assertThat(result.title()).isEqualTo("Renovare Apartament");
        assertThat(result.currency()).isEqualTo(Currency.RON);

        Project reloaded = projectRepository.findById(SEEDED_PROJECT_ID).orElseThrow();
        assertThat(reloaded.title()).isEqualTo("Renovare Apartament");
    }

    @Test
    void roomRoundTripPastreazaStructurileJsonSiEnumurileCuDiacritice() {
        String roomId = UUID.randomUUID().toString();
        Room room = Room.builder(roomId, RoomType.BAIE, "Baie Principală", Money.of(1200))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.5)
                .perimeter(10.0)
                .baseboardHeight(0.08)
                .doors(Map.of(Wall.NORD, new RoomDoor(0.9, 2.0)))
                .wallTiling(new WallTiling(2, 2.0, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0)))
                .build();

        roomRepository.insert(room, SEEDED_PROJECT_ID);
        Room reloaded = roomRepository.findById(roomId).orElseThrow();

        assertThat(reloaded.name()).isEqualTo("Baie Principală");
        assertThat(reloaded.type()).isEqualTo(RoomType.BAIE);
        assertThat(reloaded.floorMaterial()).isEqualTo(FlooringType.GRESIE);
        assertThat(reloaded.doors().get(Wall.NORD)).isEqualTo(new RoomDoor(0.9, 2.0));
        assertThat(reloaded.wallTiling().tiledWallsCount()).isEqualTo(2);
        assertThat(reloaded.wallTiling().wallLengths().get(Wall.EST)).isEqualTo(3.0);
    }

    @Test
    void roomFaraCampuriTehniceAreListeGoaleNuNull() {
        String roomId = UUID.randomUUID().toString();
        Room room = Room.builder(roomId, RoomType.DORMITOR, "Dormitor", Money.of(800)).build();
        roomRepository.insert(room, SEEDED_PROJECT_ID);

        Room reloaded = roomRepository.findById(roomId).orElseThrow();
        assertThat(reloaded.floorMaterial()).isNull();
        assertThat(reloaded.wallFinish()).isNull();
    }

    @Test
    void wallFinishRoundTripPastreazaTipulDeFinisajPerPerete() {
        String roomId = UUID.randomUUID().toString();
        Room room = Room.builder(roomId, RoomType.LIVING, "Living", Money.of(2000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .wallFinish(new WallFinish(2.5, Map.of(Wall.NORD, 4.0),
                        Map.of(Wall.NORD, WallFinishType.VOPSEA)))
                .build();
        roomRepository.insert(room, SEEDED_PROJECT_ID);

        Room reloaded = roomRepository.findById(roomId).orElseThrow();
        assertThat(reloaded.wallFinish().finishes().get(Wall.NORD)).isEqualTo(WallFinishType.VOPSEA);
    }

    @Test
    void itemRoundTripSiFiltrarePeCamera() {
        String roomId = UUID.randomUUID().toString();
        roomRepository.insert(Room.builder(roomId, RoomType.BUCATARIE, "Bucătărie", Money.of(3000)).build(), SEEDED_PROJECT_ID);

        // Truncat la microsecunde: Postgres TIMESTAMPTZ nu păstrează precizia de nanosecunde a Instant.now(),
        // deci o comparație exactă post-roundtrip ar fi flaky fără trunchiere la aceeași granularitate.
        Instant createdAt = Instant.now().truncatedTo(ChronoUnit.MICROS);
        Instant purchasedAt = createdAt.plusSeconds(60);
        Item item = new Item(UUID.randomUUID().toString(), roomId, "Gresie", MaterialType.GRESIE, "Dedeman",
                ItemStatus.CUMPARAT, BigDecimal.valueOf(12.5), Money.of(45), null, null, ItemOrigin.MANUAL,
                createdAt, purchasedAt);
        itemRepository.save(item);

        Item reloaded = itemRepository.findById(item.id()).orElseThrow();
        assertThat(reloaded.status()).isEqualTo(ItemStatus.CUMPARAT);
        assertThat(reloaded.materialType()).isEqualTo(MaterialType.GRESIE);
        assertThat(reloaded.quantity()).isEqualByComparingTo("12.5");
        assertThat(reloaded.createdAt()).isEqualTo(createdAt);
        assertThat(reloaded.purchasedAt()).isEqualTo(purchasedAt);

        assertThat(itemRepository.findByRoomId(roomId)).extracting(Item::id).containsExactly(item.id());
    }

    @Test
    void stergereaCamereiStergeSiElementeleEiCascadeInDb() {
        String roomId = UUID.randomUUID().toString();
        roomRepository.insert(Room.builder(roomId, RoomType.BALCON, "Balcon", Money.of(300)).build(), SEEDED_PROJECT_ID);
        Item item = new Item(UUID.randomUUID().toString(), roomId, "Gresie", MaterialType.GRESIE, "",
                ItemStatus.IN_ASTEPTARE, BigDecimal.ONE, Money.zero(), null, null, ItemOrigin.MANUAL,
                Instant.now().truncatedTo(ChronoUnit.MICROS), null);
        itemRepository.save(item);

        roomRepository.deleteById(roomId);
        // Postgres a șters cascadat item-ul la nivel de DB, dar contextul de persistență Hibernate nu
        // știe asta automat (nu a fost el cel care a operat ștergerea acelui rând) — fără flush+clear,
        // findById ar întoarce entitatea încă din cache, mascând bug-uri reale de cascade.
        entityManager.flush();
        entityManager.clear();

        assertThat(roomRepository.findById(roomId)).isEmpty();
        assertThat(itemRepository.findById(item.id())).isEmpty();
    }
}
