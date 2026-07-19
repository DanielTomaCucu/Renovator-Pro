package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetComparisonGroupsUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetComparisonGroupsService implements GetComparisonGroupsUseCase {

    private final RoomRepository roomRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional(readOnly = true)
    public List<GroupWithOffers> execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.VIEWER)) {
            throw new ProjectNotFoundException(projectId);
        }
        List<String> roomIds = roomRepository.findByProjectId(projectId).stream().map(Room::id).toList();
        if (roomIds.isEmpty()) return List.of();

        List<ComparisonGroup> groups = comparisonGroupRepository.findByRoomIds(roomIds);
        if (groups.isEmpty()) return List.of();

        List<String> groupIds = groups.stream().map(ComparisonGroup::id).toList();
        Map<String, List<Offer>> offersByGroup = offerRepository.findByGroupIds(groupIds).stream()
                .collect(Collectors.groupingBy(Offer::groupId));

        return groups.stream()
                .map(g -> new GroupWithOffers(g, offersByGroup.getOrDefault(g.id(), List.of())))
                .toList();
    }
}
