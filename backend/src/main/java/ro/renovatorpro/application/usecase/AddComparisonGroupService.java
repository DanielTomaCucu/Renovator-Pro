package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class AddComparisonGroupService implements AddComparisonGroupUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final RoomRepository roomRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public ComparisonGroup execute(String currentUserId, String roomId, Command command) {
        String projectId = roomRepository.findProjectIdById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new RoomNotFoundException(roomId);
        }
        ComparisonGroup group = new ComparisonGroup(
                idGenerator.newId(), roomId, command.name(), command.materialType(),
                ComparisonGroupStatus.IN_ANALIZA, null, null, timeProvider.now()
        );
        return comparisonGroupRepository.save(group);
    }
}
