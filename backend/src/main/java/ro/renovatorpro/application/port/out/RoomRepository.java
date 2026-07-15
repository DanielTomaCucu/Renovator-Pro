package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.Room;

import java.util.List;
import java.util.Optional;

public interface RoomRepository {

    Optional<Room> findById(String id);

    /** Necesar la Faza 4 (API): {@code RoomResponse} include {@code projectId}, dar {@code domain.model.Room} nu-l cunoaște (single-project azi). */
    Optional<String> findProjectIdById(String id);

    List<Room> findByProjectId(String projectId);

    /** Creează o cameră nouă — {@code projectId} explicit fiindcă {@code domain.model.Room} nu-l cunoaște (single-project azi). */
    Room insert(Room room, String projectId);

    /** Actualizează o cameră EXISTENTĂ (păstrează {@code projectId}-ul curent, citit intern) — fără parametru proiect, ca la {@link ProjectRepository#update}. */
    Room update(Room room);

    void deleteById(String id);
}
