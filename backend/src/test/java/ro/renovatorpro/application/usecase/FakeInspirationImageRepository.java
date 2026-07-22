package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.domain.model.InspirationImage;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class FakeInspirationImageRepository implements InspirationImageRepository {

    private final Map<String, InspirationImage> store = new HashMap<>();

    @Override
    public Optional<InspirationImage> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<InspirationImage> findByProjectId(String projectId) {
        return store.values().stream().filter(i -> i.projectId().equals(projectId)).toList();
    }

    @Override
    public InspirationImage save(InspirationImage image) {
        store.put(image.id(), image);
        return image;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }

    @Override
    public void clearRoomId(String roomId) {
        store.replaceAll((id, img) -> img.roomId() != null && img.roomId().equals(roomId)
                ? new InspirationImage(img.id(), img.projectId(), null, img.type(), img.image(), img.caption(), img.sourceUrl(), img.createdAt())
                : img);
    }
}
