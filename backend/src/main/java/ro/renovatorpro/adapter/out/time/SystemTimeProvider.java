package ro.renovatorpro.adapter.out.time;

import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.TimeProvider;

import java.time.Instant;

@Component
public class SystemTimeProvider implements TimeProvider {

    @Override
    public Instant now() {
        return Instant.now();
    }
}
