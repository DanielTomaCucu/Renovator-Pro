package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.IdGenerator;

import java.util.concurrent.atomic.AtomicInteger;

class FakeIdGenerator implements IdGenerator {

    private final AtomicInteger counter = new AtomicInteger();

    @Override
    public String newId() {
        return "generated-" + counter.incrementAndGet();
    }
}
