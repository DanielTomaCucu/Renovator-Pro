package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.InspirationImage;

import java.util.List;

public interface GetInspirationImagesUseCase {

    List<InspirationImage> execute(String currentUserId, String projectId);
}
