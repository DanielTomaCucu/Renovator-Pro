package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.domain.model.Offer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Oglinda {@code OfferJpaRepository.deleteByRoomId} (join pe grupuri) — de-asta ține o referință la grupuri. */
class FakeOfferRepository implements OfferRepository {

    private final Map<String, Offer> store = new HashMap<>();
    private final FakeComparisonGroupRepository groupRepository;

    FakeOfferRepository(FakeComparisonGroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Override
    public Optional<Offer> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Offer> findByGroupId(String groupId) {
        return store.values().stream().filter(o -> o.groupId().equals(groupId)).toList();
    }

    @Override
    public List<Offer> findByGroupIds(List<String> groupIds) {
        return store.values().stream().filter(o -> groupIds.contains(o.groupId())).toList();
    }

    @Override
    public Offer save(Offer offer) {
        store.put(offer.id(), offer);
        return offer;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }

    @Override
    public void deleteByGroupId(String groupId) {
        store.values().removeIf(o -> o.groupId().equals(groupId));
    }

    @Override
    public void deleteByRoomId(String roomId) {
        List<String> groupIds = groupRepository.findByRoomId(roomId).stream().map(g -> g.id()).toList();
        store.values().removeIf(o -> groupIds.contains(o.groupId()));
    }
}
