package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Room;

import java.util.List;

public interface GetRoomsUseCase {

    List<Room> execute(String currentUserId, String projectId);
}
