package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddOfferUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class AddOfferService implements AddOfferUseCase {

    private final OfferRepository offerRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final RoomRepository roomRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public Offer execute(String currentUserId, String groupId, Command command) {
        ComparisonGroup group = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        String projectId = roomRepository.findProjectIdById(group.roomId())
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ComparisonGroupNotFoundException(groupId);
        }
        Offer offer = new Offer(
                idGenerator.newId(), groupId, command.name(), command.store(), command.unitPrice(),
                command.quantity(), command.productUrl(), command.images(), command.notes(), timeProvider.now()
        );
        return offerRepository.save(offer);
    }
}
