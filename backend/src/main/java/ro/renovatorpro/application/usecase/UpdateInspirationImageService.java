package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.Patch;
import ro.renovatorpro.application.port.in.UpdateInspirationImageUseCase;
import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.InspirationImageNotFoundException;
import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class UpdateInspirationImageService implements UpdateInspirationImageUseCase {

    private final InspirationImageRepository inspirationImageRepository;
    private final RoomRepository roomRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public InspirationImage execute(String currentUserId, String id, Command command) {
        InspirationImage existing = inspirationImageRepository.findById(id)
                .orElseThrow(() -> new InspirationImageNotFoundException(id));
        if (!membershipGuard.hasRole(currentUserId, existing.projectId(), ProjectRole.EDITOR)) {
            throw new InspirationImageNotFoundException(id);
        }
        String roomId = resolveRoomId(existing.projectId(), existing.roomId(), command.roomId());
        InspirationImage patched = new InspirationImage(
                existing.id(),
                existing.projectId(),
                roomId,
                command.type().resolve(existing.type()),
                command.image().resolve(existing.image()),
                command.caption().resolve(existing.caption()),
                command.sourceUrl().resolve(existing.sourceUrl()),
                existing.createdAt()
        );
        return inspirationImageRepository.save(patched);
    }

    private String resolveRoomId(String projectId, String existingRoomId, Patch<String> patch) {
        String roomId = patch.resolve(existingRoomId);
        if (roomId == null) return null;
        String roomProjectId = roomRepository.findProjectIdById(roomId).orElse(null);
        if (!projectId.equals(roomProjectId)) {
            throw new IllegalArgumentException("roomId " + roomId + " nu aparține acestui proiect");
        }
        return roomId;
    }
}
