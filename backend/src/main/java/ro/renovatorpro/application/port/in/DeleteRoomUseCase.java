package ro.renovatorpro.application.port.in;

public interface DeleteRoomUseCase {

    /** Șterge camera ȘI elementele ei — cascade explicit la nivel de business, vezi implementarea. */
    void execute(String currentUserId, String roomId);
}
