package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;

import java.util.List;

public interface GetProjectSnapshotUseCase {

    /** {@code currentUserId} — neutilizat operațional încă (verificarea de acces vine în Faza 5); acceptat acum ca autorizarea să nu fie retrofit. */
    ProjectSnapshot execute(String currentUserId, String projectId);

    record ProjectSnapshot(Project project, List<Room> rooms, List<Item> items) {
    }
}
