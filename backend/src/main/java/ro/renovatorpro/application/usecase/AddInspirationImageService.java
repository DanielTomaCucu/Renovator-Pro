package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddInspirationImageUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class AddInspirationImageService implements AddInspirationImageUseCase {

    private final InspirationImageRepository inspirationImageRepository;
    private final RoomRepository roomRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public InspirationImage execute(String currentUserId, String projectId, Command command) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ProjectNotFoundException(projectId);
        }
        String roomId = validatedRoomId(projectId, command.roomId());
        InspirationImage image = new InspirationImage(
                idGenerator.newId(), projectId, roomId, command.type(), command.image(),
                command.caption(), command.sourceUrl(), timeProvider.now()
        );
        return inspirationImageRepository.save(image);
    }

    /** Camera trebuie să aparțină ACELUIAȘI proiect — altfel ai putea asigna o poză unei camere din alt proiect (IDOR). */
    private String validatedRoomId(String projectId, String roomId) {
        if (roomId == null) return null;
        String roomProjectId = roomRepository.findProjectIdById(roomId).orElse(null);
        if (!projectId.equals(roomProjectId)) {
            throw new IllegalArgumentException("roomId " + roomId + " nu aparține acestui proiect");
        }
        return roomId;
    }
}
