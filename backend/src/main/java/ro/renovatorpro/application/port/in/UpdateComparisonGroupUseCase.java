package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.MaterialType;

public interface UpdateComparisonGroupUseCase {

    /** PATCH nu atinge ofertele — dar {@code Result} le include (nemodificate) ca răspunsul să rămână complet. */
    GetComparisonGroupsUseCase.GroupWithOffers execute(String currentUserId, String groupId, Command command);

    /**
     * Câmp {@code null} = nu se modifică (nume/tip material nu sunt „ștergibile", nu au nevoie de
     * {@link Patch}). {@code roomId} mută grupul în altă cameră — permis DOAR cât timp grupul e
     * „În analiză" (vezi {@code UpdateComparisonGroupService}). Schimbarea de {@code roomId} sau
     * {@code materialType} re-rezolvă {@code linkedItemId} automat; {@code linkedItemId} explicit
     * (opțional) suprascrie rezolvarea automată — trebuie să fie un candidat valid pt. combinația
     * finală, altfel 400.
     */
    record Command(String name, MaterialType materialType, String roomId, String linkedItemId) {
    }
}
