package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class AddRoomService implements AddRoomUseCase {

    private final RoomRepository roomRepository;
    private final IdGenerator idGenerator;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public Room execute(String currentUserId, String projectId, Command command) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ProjectNotFoundException(projectId);
        }
        Room room = Room.builder(idGenerator.newId(), command.type(), command.name(), command.allocatedBudget())
                .floorMaterial(command.floorMaterial())
                .floorArea(command.floorArea())
                .perimeter(command.perimeter())
                .tileSize(command.tileSize())
                .installationType(command.installationType())
                .doors(command.doors())
                .baseboardHeight(command.baseboardHeight())
                .wallShape(command.wallShape())
                .wallTiling(command.wallTiling())
                .wallFinish(command.wallFinish())
                .windows(command.windows())
                .ceilingPaint(command.ceilingPaint())
                .underfloorHeating(command.underfloorHeating())
                .build();
        return roomRepository.insert(room, projectId);
    }
}
