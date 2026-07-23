package ro.renovatorpro.adapter.in.web.mapper;

import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.in.web.dto.SpendingTimelinePointResponse;
import ro.renovatorpro.application.port.in.GetSpendingTimelineUseCase.TimelinePoint;

import java.util.List;

/** {@code YearMonth.toString()} produce direct formatul ISO "yyyy-MM" — nu necesită MapStruct/conversii. */
@Component
public class SpendingTimelineDtoMapper {

    public List<SpendingTimelinePointResponse> toResponse(List<TimelinePoint> points) {
        return points.stream()
                .map(p -> new SpendingTimelinePointResponse(p.month().toString(), p.cumulativeSpent().amount(), p.cumulativeTotal().amount()))
                .toList();
    }
}
