package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;

import java.util.List;

public interface GetComparisonGroupsUseCase {

    /** Toate grupurile de comparație ale proiectului, plate — agregate peste TOATE camerele lui, fiecare cu ofertele lui. */
    List<GroupWithOffers> execute(String currentUserId, String projectId);

    record GroupWithOffers(ComparisonGroup group, List<Offer> offers) {
    }
}
