package ro.renovatorpro.application.port.in;

public interface DeleteComparisonGroupUseCase {

    /** Șterge grupul ȘI ofertele lui — NU atinge elementul de cumpărat creat eventual din el (createdItemId). */
    void execute(String currentUserId, String groupId);
}
