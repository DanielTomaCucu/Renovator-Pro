package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateOfferUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.exception.OfferNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class UpdateOfferService implements UpdateOfferUseCase {

    private final OfferRepository offerRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final RoomRepository roomRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public Offer execute(String currentUserId, String offerId, Command command) {
        Offer existing = offerRepository.findById(offerId).orElseThrow(() -> new OfferNotFoundException(offerId));
        ComparisonGroup group = comparisonGroupRepository.findById(existing.groupId())
                .orElseThrow(() -> new OfferNotFoundException(offerId));
        String projectId = roomRepository.findProjectIdById(group.roomId())
                .orElseThrow(() -> new OfferNotFoundException(offerId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new OfferNotFoundException(offerId);
        }
        Offer patched = new Offer(
                existing.id(),
                existing.groupId(),
                command.name().resolve(existing.name()),
                command.store().resolve(existing.store()),
                command.unitPrice().resolve(existing.unitPrice()),
                command.quantity().resolve(existing.quantity()),
                command.productUrl().resolve(existing.productUrl()),
                command.images().resolve(existing.images()),
                command.notes().resolve(existing.notes()),
                existing.createdAt()
        );
        return offerRepository.save(patched);
    }
}
