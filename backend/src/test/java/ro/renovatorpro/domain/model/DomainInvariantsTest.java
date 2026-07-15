package ro.renovatorpro.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DomainInvariantsTest {

    @Test
    void proiectulRefuzaTitluGol() {
        assertThatThrownBy(() -> new Project("p1", "  ", Money.zero(), Currency.EUR, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void elementulRefuzaCantitateNegativa() {
        assertThatThrownBy(() -> new Item("i1", "r1", "Gresie", MaterialType.GRESIE, "",
                ItemStatus.IN_ASTEPTARE, new BigDecimal("-1"), Money.zero(), null, null, ItemOrigin.MANUAL))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void cameraNouaAreHartiPerPeretGoale() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie Principală", Money.of(1200)).build();
        assertThat(room.doors()).isEmpty();
        assertThat(room.windows()).isEmpty();
        assertThat(room.floorMaterial()).isNull();
    }

    @Test
    void builderulPastreazaCampurileTehnice() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1200))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.5)
                .build();
        assertThat(room.floorMaterial()).isEqualTo(FlooringType.GRESIE);
        assertThat(room.floorArea()).isEqualTo(6.5);
    }
}
