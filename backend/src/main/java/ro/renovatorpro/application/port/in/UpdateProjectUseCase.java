package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;

public interface UpdateProjectUseCase {

    Project execute(String currentUserId, String projectId, Command command);

    /** Câmp {@code null} = nu se modifică. Oglindă a {@code Partial<Project>} din TS. */
    record Command(String title, Money totalBudget, Currency currency, Double totalArea) {
    }
}
