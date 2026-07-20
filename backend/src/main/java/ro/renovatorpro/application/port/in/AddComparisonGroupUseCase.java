package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.MaterialType;

public interface AddComparisonGroupUseCase {

    ComparisonGroup execute(String currentUserId, String roomId, Command command);

    /**
     * {@code linkedItemId} explicit e opțional — folosit doar la ambiguitate (≥2 candidați „Din
     * Configurare" cu același material, ex. „Amorsă zugrăveală"/„Amorsă placări"), ca userul să aleagă
     * explicit ținta din UI. Trebuie să fie un candidat valid (roomId+materialType+origin Configurare),
     * altfel 400. {@code null}/absent → rezolvare automată ({@code AutoItemReconciler#resolveLinkedItem}).
     */
    record Command(String name, MaterialType materialType, String linkedItemId) {
    }
}
