package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Item;

import java.util.List;

public interface GetItemsUseCase {

    /** Toate elementele proiectului, plat — agregate peste TOATE camerele lui (frontend-ul filtrează client-side per cameră). */
    List<Item> execute(String currentUserId, String projectId);
}
