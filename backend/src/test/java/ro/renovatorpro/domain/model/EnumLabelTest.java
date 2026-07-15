package ro.renovatorpro.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Verifică faptul că valorile string (cu diacritice) sunt identice cu enum-urile TS din frontend. */
class EnumLabelTest {

    @Test
    void labelurilePastreazaDiacriticele() {
        assertThat(ItemStatus.CUMPARAT.label()).isEqualTo("Cumpărat");
        assertThat(RoomType.BUCATARIE.label()).isEqualTo("Bucătărie");
        assertThat(MaterialType.FAIANTA.label()).isEqualTo("Faianță");
        assertThat(ItemOrigin.CONFIGURARE.label()).isEqualTo("Din Configurare");
    }

    @Test
    void fromLabelEsteInversulLuiLabel() {
        for (ItemStatus s : ItemStatus.values()) {
            assertThat(ItemStatus.fromLabel(s.label())).isEqualTo(s);
        }
        assertThat(Wall.fromLabel("N")).isEqualTo(Wall.NORD);
    }

    @Test
    void fromLabelRefuzaValoriNecunoscute() {
        assertThatThrownBy(() -> ItemStatus.fromLabel("Cumparat")) // fără diacritice = invalid
                .isInstanceOf(IllegalArgumentException.class);
    }
}
