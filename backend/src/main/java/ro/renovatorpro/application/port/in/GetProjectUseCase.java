package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Project;

public interface GetProjectUseCase {

    Project execute(String currentUserId, String projectId);
}
