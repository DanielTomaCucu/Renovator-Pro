package ro.renovatorpro.application.port.in;

public interface DeleteItemUseCase {

    void execute(String currentUserId, String itemId);
}
