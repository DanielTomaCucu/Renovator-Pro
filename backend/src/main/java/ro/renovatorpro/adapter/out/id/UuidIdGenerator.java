package ro.renovatorpro.adapter.out.id;

import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.IdGenerator;

import java.util.UUID;

/** ID-uri UUID v4 (decizie de arhitectură din docs/backend-blueprint.md §1). */
@Component
public class UuidIdGenerator implements IdGenerator {

    @Override
    public String newId() {
        return UUID.randomUUID().toString();
    }
}
