package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteOfferUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.OfferNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class DeleteOfferService implements DeleteOfferUseCase {

    private final OfferRepository offerRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final RoomRepository roomRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public void execute(String currentUserId, String offerId) {
        Offer existing = offerRepository.findById(offerId).orElseThrow(() -> new OfferNotFoundException(offerId));
        ComparisonGroup group = comparisonGroupRepository.findById(existing.groupId())
                .orElseThrow(() -> new OfferNotFoundException(offerId));
        String projectId = roomRepository.findProjectIdById(group.roomId())
                .orElseThrow(() -> new OfferNotFoundException(offerId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new OfferNotFoundException(offerId);
        }
        offerRepository.deleteById(offerId);
        // Statusul „Decis" al grupului rămâne — doar referința la oferta ștearsă dispare.
        if (offerId.equals(group.chosenOfferId())) {
            ComparisonGroup cleared = new ComparisonGroup(
                    group.id(), group.roomId(), group.name(), group.materialType(),
                    group.status(), null, group.createdItemId(), group.createdAt()
            );
            comparisonGroupRepository.save(cleared);
        }
    }
}
